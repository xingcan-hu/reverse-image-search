import type { AppUser } from '@/libs/UserService';
import { and, eq, gte, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { runImageSearch } from '@/libs/SearchProvider';
import { uploadImageToR2 } from '@/libs/Storage';
import { getOrCreateUser } from '@/libs/UserService';
import { searchLogs, users } from '@/models/Schema';

export const runtime = 'nodejs';

const SEARCH_COST = 1;
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const POST = async (request: Request) => {
  let uploadedUrl = '';
  let user: AppUser | null = null;
  let charged = false;
  let remainingCredits: number | null = null;
  let stage: 'init' | 'validate' | 'charge' | 'upload' | 'provider' | 'log' = 'init';

  try {
    user = await getOrCreateUser();
    const userId = user.id;

    stage = 'validate';
    const formData = await request.formData();
    const file = formData.get('file') ?? formData.get('image');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Please upload an image to search.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a JPG, PNG, or WEBP image.' },
        { status: 415 },
      );
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ error: 'File is too large. Max size is 5MB.' }, { status: 413 });
    }

    stage = 'charge';
    const debit = await db
      .update(users)
      .set({ credits: sql`${users.credits} - ${SEARCH_COST}` })
      .where(
        and(eq(users.id, user.id), gte(users.credits, SEARCH_COST)),
      )
      .returning({ credits: users.credits });

    const [debitRow] = debit;

    if (!debitRow) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please top up to continue.' },
        { status: 402 },
      );
    }

    charged = true;
    remainingCredits = debitRow.credits;
    logger.info('Search credit debited', () => ({
      userId,
      cost: SEARCH_COST,
      beforeCredits: debitRow.credits + SEARCH_COST,
      afterCredits: debitRow.credits,
    }));

    stage = 'upload';
    const { url } = await uploadImageToR2(file);
    uploadedUrl = url;

    stage = 'provider';
    const results = await runImageSearch(url);

    stage = 'log';
    await db.insert(searchLogs).values({
      userId,
      imageUrl: url,
      cost: SEARCH_COST,
      providerStatus: 'success',
    });

    return NextResponse.json({
      data: results,
      meta: {
        cost: SEARCH_COST,
        remainingCredits,
      },
    });
  } catch (error) {
    logger.error('Search request failed', () => ({
      stage,
      charged,
      uploadedUrl,
      userId: user?.id,
      error,
    }));

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }

    if (user) {
      const userId = user.id;
      try {
        if (charged) {
          const [refundRow] = await db
            .update(users)
            .set({ credits: sql`${users.credits} + ${SEARCH_COST}` })
            .where(eq(users.id, userId))
            .returning({ credits: users.credits });

          await db.insert(searchLogs).values({
            userId,
            imageUrl: uploadedUrl,
            cost: 0,
            providerStatus: 'failed',
          });

          logger.info('Search credit refunded', () => ({
            userId,
            refund: SEARCH_COST,
            beforeCredits: remainingCredits,
            afterCredits: refundRow?.credits ?? null,
          }));
        }
      } catch (refundError) {
        logger.error('Search credit refund failed', () => ({
          userId,
          refundError,
        }));
      }
    }

    const message = charged
      ? 'Search failed. Your credit has been refunded. Please try again.'
      : 'Search failed. Please try again.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
