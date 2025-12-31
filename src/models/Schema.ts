import { boolean, date, integer, pgTable, serial, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// It automatically run the command `db-server:file`, which apply the migration before Next.js starts in development mode,
// Alternatively, if your database is running, you can run `npm run db:migrate` and there is no need to restart the server.

// Need a database for production? Just claim it by running `npm run neon:claim`.
// Tested and compatible with Next.js Boilerplate

export const counterSchema = pgTable('counter', {
  id: serial('id').primaryKey(),
  count: integer('count').default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email'),
  stripeCustomerId: text('stripe_customer_id').unique(),
  credits: integer('credits').notNull().default(3),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // Stored in cents
  currency: text('currency').notNull().default('usd'),
  creditsAdded: integer('credits_added').notNull(),
  stripeSessionId: text('stripe_session_id').notNull().unique(),
  status: text('status').notNull().default('succeeded'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

export const searchLogs = pgTable('search_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  providerStatus: text('provider_status').notNull().default('success'),
  cost: integer('cost').notNull().default(1),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

export const userCheckins = pgTable('user_checkins', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  checkinDay: date('checkin_day', { mode: 'date' }).notNull(),
  rewardCredits: integer('reward_credits').notNull().default(1),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, table => ({
  userDayUnique: uniqueIndex('user_checkins_user_day_unique').on(table.userId, table.checkinDay),
}));

export const referralCodes = pgTable('referral_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  code: text('code').notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const referrals = pgTable('referrals', {
  id: uuid('id').defaultRandom().primaryKey(),
  inviterUserId: uuid('inviter_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  inviteeUserId: uuid('invitee_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  referralCodeId: uuid('referral_code_id')
    .notNull()
    .references(() => referralCodes.id, { onDelete: 'cascade' }),
  rewardCredits: integer('reward_credits').notNull().default(20),
  rewardGrantedAt: timestamp('reward_granted_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});
