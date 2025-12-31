import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { formatDayKey, getCheckinDay, getNextResetAt } from '@/libs/Rewards';
import { getOrCreateUser } from '@/libs/UserService';
import { userCheckins, users } from '@/models/Schema';

export const runtime = 'nodejs';

const CHECKIN_REWARD = 1;

export const POST = async () => {
  try {
    const user = await getOrCreateUser();
    const checkinDay = getCheckinDay();

    const result = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(userCheckins)
        .values({
          userId: user.id,
          checkinDay,
          rewardCredits: CHECKIN_REWARD,
        })
        .onConflictDoNothing({ target: [userCheckins.userId, userCheckins.checkinDay] })
        .returning({ id: userCheckins.id });

      if (!created) {
        const [current] = await tx
          .select({ credits: users.credits })
          .from(users)
          .where(eq(users.id, user.id));

        return {
          status: 'already' as const,
          credits: current?.credits ?? user.credits,
        };
      }

      const [updated] = await tx
        .update(users)
        .set({ credits: sql`${users.credits} + ${CHECKIN_REWARD}` })
        .where(eq(users.id, user.id))
        .returning({ credits: users.credits });

      return {
        status: 'checked_in' as const,
        credits: updated?.credits ?? user.credits + CHECKIN_REWARD,
      };
    });

    return NextResponse.json({
      ok: true,
      checkedIn: result.status === 'checked_in',
      alreadyCheckedIn: result.status === 'already',
      reward: { amount: CHECKIN_REWARD, type: 'permanent' },
      credits: result.credits,
      checkinDay: formatDayKey(checkinDay),
      nextResetAt: getNextResetAt().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }

    logger.error('Daily check-in failed', () => ({ error }));
    return NextResponse.json(
      { error: 'Unable to check in. Please try again.' },
      { status: 500 },
    );
  }
};
