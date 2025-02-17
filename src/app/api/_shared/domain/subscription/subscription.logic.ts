import { randomUUID } from 'node:crypto';
import { SubscriptionStatusEnum } from '@/enums/subscription/subscriptionStatus.enum';
import { SubscriptionCycleEnum } from '@/enums/subscription/subscriptionCycle.enum';
import type { SelectSubscription } from '@/lib/db/schema';
import { type SubscriptionEntity, subscriptionModelBaseSchema } from './subscription.entity';

const getStatus = (e: SubscriptionEntity) => {
  const now = new Date();
  if (getIsExpired(e)(now)) return SubscriptionStatusEnum.Expired;
  if (getIsCancelled(e)) return SubscriptionStatusEnum.Cancelled;
  return SubscriptionStatusEnum.Active;
};

const getIsInUse = (e: SubscriptionEntity) => (now: Date) => {
  return !getIsExpired(e)(now);
};

const getIsCancelled = (e: SubscriptionEntity) => {
  return e.cancelledAt !== null;
};

const getIsExpired = (e: SubscriptionEntity) => (now: Date) => {
  return e.expiredAt !== null && e.expiredAt < now;
};

type SubscriptionCreateProps = Omit<
  Pick<
    SubscriptionEntity,
    'userId' | 'name' | 'price' | 'currency' | 'cycle' | 'startedAt' | 'cancelledAt' | 'description'
  >,
  'expiredAt'
>;
const create = (p: SubscriptionCreateProps): SubscriptionEntity => {
  const now = new Date();
  const expiredAt = calculateExpiredAt(p.startedAt, p.cycle);
  return {
    id: randomUUID(),
    userId: p.userId,
    name: p.name,
    price: p.price,
    currency: p.currency,
    cycle: p.cycle,
    startedAt: p.startedAt,
    cancelledAt: p.cancelledAt ?? null,
    expiredAt,
    description: p.description ?? null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};

const update =
  (e: SubscriptionEntity) =>
  (props: Partial<SubscriptionEntity>): SubscriptionEntity => {
    const updated = { ...e, ...props };
    // cycleまたはstartedAtが変更された場合、expiredAtを再計算
    if (props.cycle || props.startedAt) {
      updated.expiredAt = calculateExpiredAt(updated.startedAt, updated.cycle);
    }
    return updated;
  };

const parseEntity = (data: SelectSubscription) => {
  return subscriptionModelBaseSchema.parse(data);
};

const calculateExpiredAt = (startDate: Date, cycle: SubscriptionCycleEnum): Date => {
  const result = new Date(startDate);
  switch (cycle) {
    case SubscriptionCycleEnum.OneMonth:
      result.setMonth(result.getMonth() + 1);
      break;
    case SubscriptionCycleEnum.ThreeMonths:
      result.setMonth(result.getMonth() + 3);
      break;
    case SubscriptionCycleEnum.SixMonths:
      result.setMonth(result.getMonth() + 6);
      break;
    case SubscriptionCycleEnum.OneYear:
      result.setFullYear(result.getFullYear() + 1);
      break;
  }
  return result;
};

export const Subscription = {
  getStatus,
  getIsInUse,
  getIsCancelled,
  getIsExpired,
  calculateExpiredAt,
  create,
  update,
  parseEntity,
};
