import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { users } from '@/models/Schema';
import { db } from './DB';
import { logger } from './Logger';

export const DEFAULT_STARTING_CREDITS = 3;

export type AppUser = typeof users.$inferSelect;

const getPrimaryEmail = (emailAddresses: Array<{ emailAddress: string }> = []) => {
  return emailAddresses.at(0)?.emailAddress;
};

export const getOrCreateUser = async (): Promise<AppUser> => {
  const clerkUser = await currentUser();

  if (!clerkUser?.id) {
    throw new Error('Unauthorized');
  }

  const email = getPrimaryEmail(clerkUser.emailAddresses);

  const existingUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  if (existingUser) {
    if (email && existingUser.email !== email) {
      const [updatedUser] = await db
        .update(users)
        .set({ email })
        .where(eq(users.id, existingUser.id))
        .returning();

      return updatedUser ?? existingUser;
    }

    return existingUser;
  }

  const [createdUser] = await db
    .insert(users)
    .values({
      clerkId: clerkUser.id,
      email,
      credits: DEFAULT_STARTING_CREDITS,
    })
    .returning();

  if (!createdUser) {
    throw new Error('Failed to create user');
  }

  logger.info('User created', () => ({
    userId: createdUser.id,
    clerkId: createdUser.clerkId,
    credits: createdUser.credits,
  }));

  return createdUser;
};

export const getUserByClerkId = async (clerkId: string) => {
  return db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });
};
