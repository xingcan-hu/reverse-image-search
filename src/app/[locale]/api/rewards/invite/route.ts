import { randomBytes } from 'crypto';
import { desc, eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { getOrCreateUser } from '@/libs/UserService';
import { referralCodes, referrals, users } from '@/models/Schema';
import { getBaseUrl } from '@/utils/Helpers';

export const runtime = 'nodejs';

const CODE_LENGTH = 8;

const generateReferralCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(CODE_LENGTH);
  let code = '';

  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += alphabet[bytes[i] % alphabet.length];
  }

  return code;
};

const maskEmail = (email?: string | null) => {
  if (!email) {
    return null;
  }

  const [name, domain] = email.split('@');

  if (!domain) {
    return null;
  }

  const maskedName = name.length <= 1 ? '*' : `${name[0]}***`;
  return `${maskedName}@${domain}`;
};

const getOrCreateReferralCode = async (userId: string) => {
  const existing = await db.query.referralCodes.findFirst({
    where: eq(referralCodes.userId, userId),
  });

  if (existing) {
    return existing;
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateReferralCode();
    const [created] = await db
      .insert(referralCodes)
      .values({
        userId,
        code,
      })
      .onConflictDoNothing()
      .returning();

    if (created) {
      return created;
    }
  }

  const fallback = await db.query.referralCodes.findFirst({
    where: eq(referralCodes.userId, userId),
  });

  if (!fallback) {
    throw new Error('Unable to create referral code');
  }

  return fallback;
};

export const GET = async () => {
  try {
    const user = await getOrCreateUser();
    const code = await getOrCreateReferralCode(user.id);

    const [stats] = await db
      .select({
        invitedUsers: sql<number>`count(*)`,
        creditsEarned: sql<number>`coalesce(sum(${referrals.rewardCredits}), 0)`,
      })
      .from(referrals)
      .where(eq(referrals.inviterUserId, user.id));

    const recent = await db
      .select({
        inviteeUserId: referrals.inviteeUserId,
        inviteeEmail: users.email,
        createdAt: referrals.createdAt,
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.inviteeUserId, users.id))
      .where(eq(referrals.inviterUserId, user.id))
      .orderBy(desc(referrals.createdAt))
      .limit(5);

    return NextResponse.json({
      ok: true,
      code: code.code,
      inviteUrl: `${getBaseUrl()}/invite/${code.code}`,
      stats: {
        invitedUsers: stats?.invitedUsers ?? 0,
        creditsEarned: stats?.creditsEarned ?? 0,
      },
      recent: recent.map((item) => ({
        inviteeUserId: item.inviteeUserId,
        inviteeEmailMasked: maskEmail(item.inviteeEmail),
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }

    logger.error('Invite data load failed', () => ({ error }));
    return NextResponse.json(
      { error: 'Unable to load invite data. Please try again.' },
      { status: 500 },
    );
  }
};
