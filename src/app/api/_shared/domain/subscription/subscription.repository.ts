import { Subscription } from '@/app/api/_shared/domain/subscription/subscription.logic';
import type { DrizzleClient } from '@/lib/db/drizzle';
import { subscriptionsTable } from '@/lib/db/schema';
import type { Tx } from '@/types/api/tx';
import { and, asc, eq, gt, isNull } from 'drizzle-orm';
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
      where: and(eq(subscriptionsTable.userId, p.userId), gt(subscriptionsTable.expiredAt, p.now), isNull(subscriptionsTable.deletedAt)),
      orderBy: [asc(subscriptionsTable.expiredAt)],
    });
    return subscriptions.map(Subscription.parseEntity);
  };

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

export const SubscriptionRepository = (inject: Inject) => ({
  create: create(inject),
  update: update(inject),
  findManyInUse: findManyInUse(inject),
  findByIdAndUserId: findByIdAndUserId(inject),
});

export type SubscriptionRepository = ReturnType<typeof SubscriptionRepository>;
