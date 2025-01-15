import { sql } from 'drizzle-orm';
import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// usersテーブル
export const usersTable = pgTable('users', {
  id: text('id').primaryKey(),
  nickname: text('nickname').notNull(),
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
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id),
    name: text('name').notNull(),
    price: integer('price').notNull(),
    cycle: text('cycle').notNull(),
    startedAt: timestamp('started_at').notNull(),
    nextPaymentAt: timestamp('next_payment_at').notNull(),
    description: text('description'),
    status: text('status').notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    deletedAt: timestamp('deleted_at'),
  },
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
