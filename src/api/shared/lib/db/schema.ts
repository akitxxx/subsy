import { relations, sql } from 'drizzle-orm';
import { index, numeric, pgTable, primaryKey, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core';

/**
 * データベースのテーブル名を定義
 */
export const TABLE_NAMES = {
  User: 'users',
  UserAuth: 'user_auths',
  Subscription: 'subscriptions',
} as const;

/**
 * テーブル名の配列
 * truncateなどの一括操作で使用
 */
export const ALL_TABLES = Object.values(TABLE_NAMES);

// ===== usersテーブル =====
export const usersTable = pgTable(TABLE_NAMES.User, {
  id: uuid('id').primaryKey().defaultRandom(),
  nickname: varchar('nickname', { length: 255 }).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
export const usersRelations = relations(usersTable, ({ one, many }) => ({
  userAuths: many(userAuthsTable),
  subscriptions: many(subscriptionsTable),
}));
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

// user_authsテーブル
export const userAuthsTable = pgTable(
  TABLE_NAMES.UserAuth,
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

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.provider] }),
    providerIdIdx: index('user_auths_provider_id_idx').on(table.providerId),
    uniqueProviderConstraint: unique('user_auths_provider_unique_idx').on(table.provider, table.providerId),
    uniqueUserIdAndProviderIdConstraint: unique('user_auths_user_id_provider_id_unique_idx').on(table.userId, table.providerId),
    uniqueUserIdAndProviderConstraint: unique('user_auths_user_id_provider_unique_idx').on(table.userId, table.provider),
  }),
);
export const userAuthsRelations = relations(userAuthsTable, ({ one }) => ({
  user: one(usersTable, { fields: [userAuthsTable.userId], references: [usersTable.id] }),
}));
export type SelectUserAuth = typeof userAuthsTable.$inferSelect;
export type InsertUserAuth = typeof userAuthsTable.$inferInsert;

// subscriptionsテーブル
export const subscriptionsTable = pgTable(
  TABLE_NAMES.Subscription,
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id),
    name: varchar('name', { length: 255 }).notNull(),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).notNull(),
    cycle: varchar('cycle', { length: 255 }).notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    // 期限がない=次の自動更新予定がある
    expiredAt: timestamp('expired_at', { withTimezone: true }),
    description: text('description'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`CURRENT_TIMESTAMP`),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  // index
  (table) => ({
    userIdIdx: index('subscriptions_user_id_idx').on(table.userId),
    startedAtIdx: index('subscriptions_started_at_idx').on(table.startedAt),
    cancelledAtIdx: index('subscriptions_cancelled_at_idx').on(table.cancelledAt),
    expiredAtIdx: index('subscriptions_expired_at_idx').on(table.expiredAt),
    uniqueUserIdAndNameConstraint: unique('subscriptions_user_id_name_unique_idx').on(table.userId, table.name),
  }),
);
export const subscriptionsRelations = relations(subscriptionsTable, ({ one }) => ({
  user: one(usersTable, { fields: [subscriptionsTable.userId], references: [usersTable.id] }),
}));
export type SelectSubscription = typeof subscriptionsTable.$inferSelect;
export type InsertSubscription = typeof subscriptionsTable.$inferInsert;
