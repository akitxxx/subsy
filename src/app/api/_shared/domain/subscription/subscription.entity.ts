import { randomUUID } from 'node:crypto';
import type { InsertSubscription, SelectSubscription } from '@/lib/db/schema';

export type SubscriptionCreateProps = InsertSubscription;
const newSubscription = (p: SubscriptionCreateProps): SubscriptionEntity => {
  const now = new Date();
  return {
    id: randomUUID(),
    userId: p.userId,
    name: p.name,
    price: p.price,
    cycle: p.cycle,
    startedAt: p.startedAt,
    nextPaymentAt: p.nextPaymentAt,
    description: p.description ?? null,
    status: p.status,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};

export const Subscription = {
  newSubscription,
};

export type SubscriptionEntity = SelectSubscription;
