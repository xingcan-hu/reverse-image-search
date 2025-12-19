import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { getOrCreateUser } from '@/libs/UserService';
import { transactions } from '@/models/Schema';

export const runtime = 'nodejs';

export const GET = async () => {
  try {
    const user = await getOrCreateUser();

    const items = await db.query.transactions.findMany({
      where: eq(transactions.userId, user.id),
      orderBy: desc(transactions.createdAt),
      limit: 10,
    });

    return NextResponse.json({ transactions: items });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }

    logger.error('Transaction history load failed', () => ({ error }));
    return NextResponse.json(
      { error: 'Unable to load transactions. Please try again.' },
      { status: 500 },
    );
  }
};
