import { and, asc, count, eq, gt, isNull, lt, or } from 'drizzle-orm';
import { Subscription } from '@/api/shared/domain/subscription';
import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import { subscriptionsTable } from '@/api/shared/lib/db/schema';
import type { Tx } from '@/api/shared/types/tx';
import type { SubscriptionEntity } from './subscription.entity';

type Inject = {
  db: DrizzleClient;
};

const findByIdAndUserId =
  ({ db }: Inject) =>
  async ({ tx, id, userId }: { tx?: Tx; id: string; userId: string }): Promise<SubscriptionEntity | null> => {
    const client = tx ?? db;
    const subscription = await client.query.subscriptionsTable.findFirst({
      where: and(eq(subscriptionsTable.id, id), eq(subscriptionsTable.userId, userId)),
    });
    return subscription ? Subscription.parseEntity(subscription) : null;
  };

const countByUserIdAndName =
  ({ db }: Inject) =>
  async ({ userId, name }: { userId: string; name: string }): Promise<number> => {
    const result = await db
      .select({ count: count() })
      .from(subscriptionsTable)
      .where(and(eq(subscriptionsTable.userId, userId), eq(subscriptionsTable.name, name)));
    return result[0].count;
  };

const findManyByUserId =
  ({ db }: Inject) =>
  async ({ tx: _tx, userId }: { tx?: Tx; userId: string }): Promise<SubscriptionEntity[]> => {
    const subscriptions = await db.query.subscriptionsTable.findMany({
      where: eq(subscriptionsTable.userId, userId),
    });
    return subscriptions.map(Subscription.parseEntity);
  };

/** 有効なサブスクリプションと期限切れ(2週間以内)のサブスクリプションを取得 */
const findManyActiveAndRecentlyExpired =
  ({ db }: Inject) =>
  async (p: { userId: string; now: Date }): Promise<SubscriptionEntity[]> => {
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
  };

/** サブスクリプションを取得 */
// TODO: perf: nextPaymentAtをSQL側で計算して取得したい、パフォーマンス向上のため
const findManyWillNextPaymentByUserId =
  ({ db }: Inject) =>
  async (p: { userId: string }): Promise<SubscriptionEntity[]> => {
    const subscriptions = await db.query.subscriptionsTable.findMany({
      where: and(
        eq(subscriptionsTable.userId, p.userId),
        isNull(subscriptionsTable.expiredAt), // 期限がない=次の更新がある
        isNull(subscriptionsTable.deletedAt),
      ),
    });
    return subscriptions.map(Subscription.parseEntity);
  };

// ========== cud ==========

const create =
  ({ db }: Inject) =>
  async ({ tx, entity }: { tx?: Tx; entity: SubscriptionEntity }) => {
    const fCreate = async (tx: Tx) => {
      const [createdSubscription] = await tx.insert(subscriptionsTable).values(entity).returning();
      return createdSubscription;
    };

    tx ? await fCreate(tx) : await db.transaction(fCreate);
  };

const update =
  ({ db }: Inject) =>
  async ({ tx, entity }: { tx?: Tx; entity: SubscriptionEntity }) => {
    const fUpdate = async (tx: Tx) => {
      const [updatedSubscription] = await tx.update(subscriptionsTable).set(entity).where(eq(subscriptionsTable.id, entity.id)).returning();
      return updatedSubscription;
    };

    tx ? await fUpdate(tx) : await db.transaction(fUpdate);
  };

const deleteOne =
  ({ db }: Inject) =>
  async ({ tx, id, userId }: { tx?: Tx; id: string; userId: string }) => {
    const fDelete = async (tx: Tx) => {
      await tx.delete(subscriptionsTable).where(and(eq(subscriptionsTable.id, id), eq(subscriptionsTable.userId, userId)));
    };

    tx ? await fDelete(tx) : await db.transaction(fDelete);
  };

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
