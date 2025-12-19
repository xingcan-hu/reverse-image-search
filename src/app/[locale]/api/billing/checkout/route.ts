import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { findPackageById } from '@/libs/Billing';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';
import { getStripeClient } from '@/libs/Stripe';
import { DEFAULT_STARTING_CREDITS } from '@/libs/UserService';
import { users } from '@/models/Schema';
import { getBaseUrl } from '@/utils/Helpers';

export const runtime = 'nodejs';

export const POST = async (request: Request) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
  }

  const body = await request.json();
  const packageId = body.packageId as string;

  const creditPackage = packageId ? findPackageById(packageId) : null;

  if (!creditPackage) {
    return NextResponse.json(
      { error: 'Invalid package. Please refresh and try again.' },
      { status: 400 },
    );
  }

  if (!Env.STRIPE_SECRET_KEY) {
    logger.error('Stripe is not configured', () => ({ userId, packageId }));
    return NextResponse.json(
      { error: 'Payments are temporarily unavailable. Please try again later.' },
      { status: 503 },
    );
  }

  const stripe = getStripeClient();

  try {
    const clerkProfile = await currentUser();
    const email = clerkProfile?.emailAddresses?.at(0)?.emailAddress;

    const [dbUser] = await db
      .insert(users)
      .values({
        clerkId: userId,
        credits: DEFAULT_STARTING_CREDITS,
        email,
      })
      .onConflictDoNothing({ target: users.clerkId })
      .returning();

    const user = dbUser ?? (await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    }));

    if (!user) {
      return NextResponse.json(
        { error: 'Account not found. Please sign out and sign in again.' },
        { status: 404 },
      );
    }

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          clerkId: user.clerkId,
          userId: user.id,
        },
      });

      stripeCustomerId = customer.id;

      await db
        .update(users)
        .set({ stripeCustomerId, email })
        .where(eq(users.id, user.id));
    }

    const successUrl = `${getBaseUrl()}/account?success=true`;
    const cancelUrl = `${getBaseUrl()}/pricing?canceled=true`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: creditPackage.id,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: stripeCustomerId,
      metadata: {
        userId: user.id,
        credits: creditPackage.credits,
        packageId: creditPackage.id,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Unable to start checkout. Please try again.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    logger.error('Checkout session creation failed', () => ({
      userId,
      packageId,
      error,
    }));
    return NextResponse.json(
      { error: 'Unable to start checkout. Please try again.' },
      { status: 500 },
    );
  }
};
