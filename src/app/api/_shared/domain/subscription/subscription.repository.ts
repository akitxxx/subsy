import type { DrizzleClient } from '@/lib/db/drizzle';
import { subscriptionsTable } from '@/lib/db/schema';
import type { Tx } from '@/types/api/tx';
import { eq } from 'drizzle-orm';
import type { SubscriptionEntity } from './subscription.entity';

type Inject = {
  db: DrizzleClient;
};

export type SubscriptionRepository = ReturnType<typeof SubscriptionRepository>;

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
});
