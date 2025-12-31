import { cookies } from 'next/headers';
import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { getOrCreateUser } from '@/libs/UserService';
import { referralCodes, referrals, searchLogs, transactions, users } from '@/models/Schema';

export const runtime = 'nodejs';

const REFERRAL_REWARD = 20;

const getClaimCode = async (request: Request) => {
  let code = '';
  let fromCookie = false;

  try {
    const body = await request.json();
    if (body && typeof body.code === 'string') {
      code = body.code;
    }
  } catch {
    // ignore invalid json
  }

  if (!code) {
    const cookieStore = await cookies();
    const stored = cookieStore.get('referral_code')?.value;
    if (stored) {
      code = stored;
      fromCookie = true;
    }
  }

  return { code: code.trim().toUpperCase(), fromCookie };
};

export const POST = async (request: Request) => {
  try {
    const user = await getOrCreateUser();
    const { code, fromCookie } = await getClaimCode(request);

    if (!code) {
      return NextResponse.json({
        ok: true,
        claimed: false,
        alreadyClaimed: false,
        reason: 'missing_code',
      });
    }

    const result = await db.transaction(async (tx) => {
      const referralCode = await tx.query.referralCodes.findFirst({
        where: eq(referralCodes.code, code),
      });

      if (!referralCode || !referralCode.isActive) {
        return { status: 'invalid' as const };
      }

      if (referralCode.userId === user.id) {
        return { status: 'self' as const };
      }

      const existing = await tx.query.referrals.findFirst({
        where: eq(referrals.inviteeUserId, user.id),
      });

      if (existing) {
        return { status: 'already' as const, inviterUserId: existing.inviterUserId };
      }

      const hasSearch = await tx.query.searchLogs.findFirst({
        where: eq(searchLogs.userId, user.id),
      });
      const hasTransaction = await tx.query.transactions.findFirst({
        where: eq(transactions.userId, user.id),
      });

      if (hasSearch || hasTransaction) {
        return { status: 'not_eligible' as const };
      }

      const [created] = await tx
        .insert(referrals)
        .values({
          inviterUserId: referralCode.userId,
          inviteeUserId: user.id,
          referralCodeId: referralCode.id,
          rewardCredits: REFERRAL_REWARD,
          rewardGrantedAt: new Date(),
        })
        .onConflictDoNothing({ target: referrals.inviteeUserId })
        .returning({ id: referrals.id });

      if (!created) {
        return { status: 'already' as const, inviterUserId: referralCode.userId };
      }

      await tx
        .update(users)
        .set({ credits: sql`${users.credits} + ${REFERRAL_REWARD}` })
        .where(eq(users.id, referralCode.userId));

      return { status: 'claimed' as const, inviterUserId: referralCode.userId };
    });

    let payload: Record<string, unknown>;

    switch (result.status) {
      case 'invalid':
        payload = { ok: false, claimed: false, error: 'Invalid referral code.' };
        break;
      case 'self':
        payload = { ok: false, claimed: false, error: 'You cannot invite yourself.' };
        break;
      case 'not_eligible':
        payload = { ok: true, claimed: false, alreadyClaimed: false, reason: 'not_eligible' };
        break;
      case 'already':
        payload = {
          ok: true,
          claimed: false,
          alreadyClaimed: true,
          inviterUserId: result.inviterUserId,
        };
        break;
      case 'claimed':
        payload = {
          ok: true,
          claimed: true,
          alreadyClaimed: false,
          inviterUserId: result.inviterUserId,
          rewardGranted: { amount: REFERRAL_REWARD, type: 'permanent' },
        };
        break;
      default:
        payload = { ok: false, claimed: false, error: 'Unable to claim referral.' };
    }

    const response = NextResponse.json(payload);

    if (fromCookie) {
      response.cookies.set('referral_code', '', { path: '/', maxAge: 0 });
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }

    logger.error('Referral claim failed', () => ({ error }));
    return NextResponse.json(
      { error: 'Unable to claim referral. Please try again.' },
      { status: 500 },
    );
  }
};
