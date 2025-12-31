import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { formatDayKey, getCheckinDay, getNextResetAt } from '@/libs/Rewards';
import { getOrCreateUser } from '@/libs/UserService';
import { userCheckins } from '@/models/Schema';

export const runtime = 'nodejs';

export const GET = async () => {
  try {
    const user = await getOrCreateUser();
    const checkinDay = getCheckinDay();

    const existing = await db.query.userCheckins.findFirst({
      where: and(
        eq(userCheckins.userId, user.id),
        eq(userCheckins.checkinDay, checkinDay),
      ),
    });

    return NextResponse.json({
      ok: true,
      checkedInToday: Boolean(existing),
      checkinDay: formatDayKey(checkinDay),
      nextResetAt: getNextResetAt().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }

    logger.error('Check-in status load failed', () => ({ error }));
    return NextResponse.json(
      { error: 'Unable to load check-in status. Please try again.' },
      { status: 500 },
    );
  }
};
