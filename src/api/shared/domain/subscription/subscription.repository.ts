import { and, asc, count, eq, gt, isNull, lt, or } from 'drizzle-orm';
import { Effect } from 'effect';
import { Subscription } from '@/api/shared/domain/subscription';
import { InternalServerError } from '@/api/shared/error/errors';
import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import { subscriptionsTable } from '@/api/shared/lib/db/schema';
import type { Tx } from '@/api/shared/types/tx';
import type { SubscriptionEntity } from './subscription.entity';

type Inject = {
  db: DrizzleClient;
};

const findByIdAndUserId =
  ({ db }: Inject) =>
  ({ tx, id, userId }: { tx?: Tx; id: string; userId: string }): Effect.Effect<SubscriptionEntity | null, InternalServerError> =>
    Effect.tryPromise({
      try: async () => {
        const client = tx ?? db;
        const subscription = await client.query.subscriptionsTable.findFirst({
          where: and(eq(subscriptionsTable.id, id), eq(subscriptionsTable.userId, userId)),
        });
        return subscription ? Subscription.parseEntity(subscription) : null;
      },
      catch: () => new InternalServerError('サブスクリプションの取得に失敗しました'),
    });

const countByUserIdAndName =
  ({ db }: Inject) =>
  ({ userId, name }: { userId: string; name: string }): Effect.Effect<number, InternalServerError> =>
    Effect.tryPromise({
      try: async () => {
        const result = await db
          .select({ count: count() })
          .from(subscriptionsTable)
          .where(and(eq(subscriptionsTable.userId, userId), eq(subscriptionsTable.name, name)));
        return result[0].count;
      },
      catch: () => new InternalServerError('サブスクリプションの確認に失敗しました'),
    });

const findManyByUserId =
  ({ db }: Inject) =>
  ({ tx: _tx, userId }: { tx?: Tx; userId: string }): Effect.Effect<SubscriptionEntity[], InternalServerError> =>
    Effect.tryPromise({
      try: async () => {
        const subscriptions = await db.query.subscriptionsTable.findMany({
          where: eq(subscriptionsTable.userId, userId),
        });
        return subscriptions.map(Subscription.parseEntity);
      },
      catch: () => new InternalServerError('サブスクリプション一覧の取得に失敗しました'),
    });

/** 有効なサブスクリプションと期限切れ(2週間以内)のサブスクリプションを取得 */
const findManyActiveAndRecentlyExpired =
  ({ db }: Inject) =>
  (p: { userId: string; now: Date }): Effect.Effect<SubscriptionEntity[], InternalServerError> =>
    Effect.tryPromise({
      try: async () => {
        // 現在の日付から2週間前の日付を計算
        const twoWeeksAgo = new Date(p.now);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const subscriptions = await db.query.subscriptionsTable.findMany({
          where: and(
            eq(subscriptionsTable.userId, p.userId),
            // 有効期限が切れていないか、有効期限がない、または期限切れから2週間以内
            or(
              gt(subscriptionsTable.expiredAt, p.now), // 有効期限が現在より後
              isNull(subscriptionsTable.expiredAt), // 有効期限がない
              and(
                // 期限切れだが2週間以内
                lt(subscriptionsTable.expiredAt, p.now),
                gt(subscriptionsTable.expiredAt, twoWeeksAgo),
              ),
            ),
            isNull(subscriptionsTable.deletedAt),
          ),
          orderBy: [asc(subscriptionsTable.expiredAt)],
        });
        return subscriptions.map(Subscription.parseEntity);
      },
      catch: () => new InternalServerError('サブスクリプションの取得に失敗しました'),
    });

/** サブスクリプションを取得 */
// TODO: perf: nextPaymentAtをSQL側で計算して取得したい、パフォーマンス向上のため
const findManyWillNextPaymentByUserId =
  ({ db }: Inject) =>
  (p: { userId: string }): Effect.Effect<SubscriptionEntity[], InternalServerError> =>
    Effect.tryPromise({
      try: async () => {
        const subscriptions = await db.query.subscriptionsTable.findMany({
          where: and(
            eq(subscriptionsTable.userId, p.userId),
            isNull(subscriptionsTable.expiredAt), // 期限がない=次の更新がある
            isNull(subscriptionsTable.deletedAt),
          ),
        });
        return subscriptions.map(Subscription.parseEntity);
      },
      catch: () => new InternalServerError('サブスクリプションの取得に失敗しました'),
    });

// ========== cud ==========

const create =
  ({ db }: Inject) =>
  ({ tx, entity }: { tx?: Tx; entity: SubscriptionEntity }): Effect.Effect<void, InternalServerError> =>
    Effect.tryPromise({
      try: async () => {
        const fCreate = async (tx: Tx) => {
          const [createdSubscription] = await tx.insert(subscriptionsTable).values(entity).returning();
          return createdSubscription;
        };

        tx ? await fCreate(tx) : await db.transaction(fCreate);
      },
      catch: () => new InternalServerError('サブスクリプションの作成に失敗しました'),
    });

const update =
  ({ db }: Inject) =>
  ({ tx, entity }: { tx?: Tx; entity: SubscriptionEntity }): Effect.Effect<void, InternalServerError> =>
    Effect.tryPromise({
      try: async () => {
        const fUpdate = async (tx: Tx) => {
          const [updatedSubscription] = await tx.update(subscriptionsTable).set(entity).where(eq(subscriptionsTable.id, entity.id)).returning();
          return updatedSubscription;
        };

        tx ? await fUpdate(tx) : await db.transaction(fUpdate);
      },
      catch: () => new InternalServerError('サブスクリプションの更新に失敗しました'),
    });

const deleteOne =
  ({ db }: Inject) =>
  ({ tx, id, userId }: { tx?: Tx; id: string; userId: string }): Effect.Effect<void, InternalServerError> =>
    Effect.tryPromise({
      try: async () => {
        const fDelete = async (tx: Tx) => {
          await tx.delete(subscriptionsTable).where(and(eq(subscriptionsTable.id, id), eq(subscriptionsTable.userId, userId)));
        };

        tx ? await fDelete(tx) : await db.transaction(fDelete);
      },
      catch: () => new InternalServerError('サブスクリプションの削除に失敗しました'),
    });

export const SubscriptionRepository = {
  new: (inject: Inject) => ({
    create: create(inject),
    update: update(inject),
    delete: deleteOne(inject),
    findByIdAndUserId: findByIdAndUserId(inject),
    countByUserIdAndName: countByUserIdAndName(inject),
    findManyByUserId: findManyByUserId(inject),
    findManyActiveAndRecentlyExpired: findManyActiveAndRecentlyExpired(inject),
    findManyWillNextPaymentByUserId: findManyWillNextPaymentByUserId(inject),
  }),
};

export type SubscriptionRepository = ReturnType<typeof SubscriptionRepository.new>;
