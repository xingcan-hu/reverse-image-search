import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { getOrCreateUser } from '@/libs/UserService';

export const runtime = 'nodejs';

export const GET = async () => {
  try {
    const user = await getOrCreateUser();

    return NextResponse.json({
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      credits: user.credits,
      stripeCustomerId: user.stripeCustomerId,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }

    logger.error('Profile load failed', () => ({ error }));
    return NextResponse.json(
      { error: 'Unable to load your profile. Please try again.' },
      { status: 500 },
    );
  }
};
