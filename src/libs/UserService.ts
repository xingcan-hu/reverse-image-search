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

const syncUserEmail = async (user: AppUser, email?: string): Promise<AppUser> => {
  if (!email || user.email === email) {
    return user;
  }

  const [updatedUser] = await db
    .update(users)
    .set({ email })
    .where(eq(users.id, user.id))
    .returning();

  return updatedUser ?? user;
};

export const getOrCreateUser = async (): Promise<AppUser> => {
  const clerkUser = await currentUser();

  if (!clerkUser?.id) {
    throw new Error('Unauthorized');
  }

  const clerkId = clerkUser.id;
  const email = getPrimaryEmail(clerkUser.emailAddresses);

  const existingUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (existingUser) {
    return syncUserEmail(existingUser, email);
  }

  const [createdUser] = await db
    .insert(users)
    .values({
      clerkId,
      email,
      credits: DEFAULT_STARTING_CREDITS,
    })
    .onConflictDoNothing({ target: users.clerkId })
    .returning();

  if (createdUser) {
    logger.info('User created', () => ({
      userId: createdUser.id,
      clerkId: createdUser.clerkId,
      credits: createdUser.credits,
    }));

    return createdUser;
  }

  const conflictedUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!conflictedUser) {
    throw new Error('Failed to load user');
  }

  return syncUserEmail(conflictedUser, email);
};

export const getUserByClerkId = async (clerkId: string) => {
  return db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });
};
