import { relations, sql } from 'drizzle-orm';
import { index, numeric, pgTable, primaryKey, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core';

// usersテーブル
export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  nickname: varchar('nickname', { length: 255 }).notNull(),

  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  deletedAt: timestamp('deleted_at'),
});
export const usersRelations = relations(usersTable, ({ one, many }) => ({
  userAuth: one(userAuthsTable, { fields: [usersTable.id], references: [userAuthsTable.userId] }),
  subscriptions: many(subscriptionsTable),
}));
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

// user_authsテーブル
export const userAuthsTable = pgTable(
  'user_auths',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    provider: varchar('provider', { length: 255 }).notNull(),
    // providerのuser id
    providerId: varchar('provider_id', { length: 255 }).notNull(),

    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.provider] }),
    providerIdIdx: index('user_auths_provider_id_idx').on(table.providerId),
    uniqueProviderConstraint: unique('user_auths_provider_unique_idx').on(table.provider, table.providerId),
  }),
);
export const userAuthsRelations = relations(userAuthsTable, ({ one }) => ({
  user: one(usersTable, { fields: [userAuthsTable.userId], references: [usersTable.id] }),
}));
export type SelectUserAuth = typeof userAuthsTable.$inferSelect;
export type InsertUserAuth = typeof userAuthsTable.$inferInsert;

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

    createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    deletedAt: timestamp('deleted_at'),
  },
  // index
  (table) => ({
    userIdIdx: index('subscriptions_user_id_idx').on(table.userId),
    nextPaymentAtIdx: index('subscriptions_next_payment_at_idx').on(table.nextPaymentAt),
    statusIdx: index('subscriptions_status_idx').on(table.status),
  }),
);
export const subscriptionsRelations = relations(subscriptionsTable, ({ one }) => ({
  user: one(usersTable, { fields: [subscriptionsTable.userId], references: [usersTable.id] }),
}));
export type SelectSubscription = typeof subscriptionsTable.$inferSelect;
export type InsertSubscription = typeof subscriptionsTable.$inferInsert;
