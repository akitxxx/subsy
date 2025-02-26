import { Subscription } from '@/api/shared/domain/subscription';
import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import { subscriptionsTable } from '@/api/shared/lib/db/schema';
import type { Tx } from '@/api/shared/types/tx';
import { and, asc, eq, gt, isNull, or } from 'drizzle-orm';
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

const findManyInUse =
  ({ db }: Inject) =>
  async (p: { userId: string; now: Date }): Promise<SubscriptionEntity[]> => {
    const subscriptions = await db.query.subscriptionsTable.findMany({
      where: and(
        eq(subscriptionsTable.userId, p.userId),
        // 有効期限が切れていないか、有効期限がない
        or(gt(subscriptionsTable.expiredAt, p.now), isNull(subscriptionsTable.expiredAt)),
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

export const SubscriptionRepository = (inject: Inject) => ({
  create: create(inject),
  update: update(inject),
  delete: deleteOne(inject),
  findByIdAndUserId: findByIdAndUserId(inject),
  findManyInUse: findManyInUse(inject),
  findManyWillNextPaymentByUserId: findManyWillNextPaymentByUserId(inject),
});

export type SubscriptionRepository = ReturnType<typeof SubscriptionRepository>;
