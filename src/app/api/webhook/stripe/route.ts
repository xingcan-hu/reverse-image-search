import type Stripe from 'stripe';
import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';
import { getStripeClient } from '@/libs/Stripe';
import { transactions, users } from '@/models/Schema';

export const runtime = 'nodejs';

export const POST = async (request: Request) => {
  if (!Env.STRIPE_WEBHOOK_SECRET || !Env.STRIPE_SECRET_KEY) {
    logger.error('Stripe webhook is not configured', () => ({
      hasWebhookSecret: Boolean(Env.STRIPE_WEBHOOK_SECRET),
      hasSecretKey: Boolean(Env.STRIPE_SECRET_KEY),
    }));
    return NextResponse.json({ error: 'Webhook is not configured' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    logger.warn('Stripe webhook request missing signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;

  try {
    event = getStripeClient().webhooks.constructEvent(
      payload,
      signature,
      Env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    logger.warn('Stripe webhook signature verification failed', () => ({ error }));
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    try {
      const session = event.data.object as Stripe.Checkout.Session;
      const credits = Number(session.metadata?.credits ?? 0);
      const userId = session.metadata?.userId;

      if (!userId || Number.isNaN(credits) || credits <= 0) {
        logger.warn('Stripe checkout session missing required metadata', () => ({
          sessionId: session.id,
          userId,
          credits,
        }));
        return NextResponse.json({ received: true });
      }

      await db.transaction(async (tx) => {
        const existing = await tx.query.transactions.findFirst({
          where: eq(transactions.stripeSessionId, session.id),
        });

        if (existing) {
          logger.info('Stripe checkout session already processed', () => ({
            sessionId: session.id,
            userId,
          }));
          return;
        }

        const user = await tx.query.users.findFirst({
          where: eq(users.id, userId),
        });

        if (!user) {
          logger.warn('User not found for Stripe webhook credit', () => ({
            userId,
            sessionId: session.id,
          }));
          return;
        }

        await tx
          .update(users)
          .set({ credits: sql`${users.credits} + ${credits}` })
          .where(eq(users.id, user.id));

        await tx.insert(transactions).values({
          userId: user.id,
          amount: session.amount_total ?? 0,
          currency: session.currency ?? 'usd',
          creditsAdded: credits,
          stripeSessionId: session.id,
          status: session.payment_status ?? 'succeeded',
        });

        logger.info('Credits credited from Stripe checkout', () => ({
          userId: user.id,
          sessionId: session.id,
          credits,
          amount: session.amount_total ?? 0,
          currency: session.currency ?? 'usd',
          paymentStatus: session.payment_status ?? 'succeeded',
        }));
      });
    } catch (handlerError) {
      logger.error('Stripe webhook handler failed', () => ({
        eventType: event.type,
        handlerError,
      }));
      return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
};
