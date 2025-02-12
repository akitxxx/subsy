import type { DrizzleClient } from '@/lib/db/drizzle';
import { subscriptionsTable } from '@/lib/db/schema';
import type { Tx } from '@/types/api/tx';
import { IN_USE_SUBSCRIPTION_STATUS } from '@/types/enums/subscription/subscriptionStatus.enum';
import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import type { SubscriptionEntity } from './subscription.entity';

type Inject = {
  db: DrizzleClient;
};

const findManyInUse =
  ({ db }: Inject) =>
  async (p: { userId: string }) => {
    const subscriptions = await db.query.subscriptionsTable.findMany({
      where: and(inArray(subscriptionsTable.status, IN_USE_SUBSCRIPTION_STATUS), eq(subscriptionsTable.userId, p.userId)),
      orderBy: [asc(subscriptionsTable.nextPaymentAt)],
    });
    return subscriptions;
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
});

export type SubscriptionRepository = ReturnType<typeof SubscriptionRepository>;
