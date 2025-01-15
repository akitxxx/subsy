import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// usersテーブル
export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  nickname: varchar('nickname', { length: 255 }).notNull(),

  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  deletedAt: timestamp('deleted_at'),
});
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

// subscriptionsテーブル
export const subscriptionsTable = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id),
    name: varchar('name', { length: 255 }).notNull(),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    cycle: varchar('cycle', { length: 255 }).notNull(),
    startedAt: timestamp('started_at').notNull(),
    nextPaymentAt: timestamp('next_payment_at').notNull(),
    description: text('description'),
    status: varchar('status', { length: 255 }).notNull(),

    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    deletedAt: timestamp('deleted_at'),
  },
  // index
  (table) => ({
    userIdIdx: index('subscriptions_user_id_idx').on(table.userId),
    nextPaymentAtIdx: index('subscriptions_next_payment_at_idx').on(
      table.nextPaymentAt,
    ),
    statusIdx: index('subscriptions_status_idx').on(table.status),
  }),
);
export type SelectSubscription = typeof subscriptionsTable.$inferSelect;
export type InsertSubscription = typeof subscriptionsTable.$inferInsert;
