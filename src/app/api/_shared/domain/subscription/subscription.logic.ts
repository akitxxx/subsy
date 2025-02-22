import { randomUUID } from 'node:crypto';
import { SubscriptionCycleEnum } from '@/enums/subscription/subscriptionCycle.enum';
import { SubscriptionStatusEnum } from '@/enums/subscription/subscriptionStatus.enum';
import type { SelectSubscription } from '@/lib/db/schema';
import type { SubscriptionEntity } from './subscription.entity';
import { subscriptionModelBaseSchema } from './subscription.entity';

const getStatus = (e: SubscriptionEntity) => {
  if (getIsExpired(e)) return SubscriptionStatusEnum.Expired;
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

export const _calculateExpiredAt = (p: { cycle: SubscriptionCycleEnum; startedAt: Date; cancelledAt: Date }) => {
  // サイクルに応じて月数を計算
  let monthsPerCycle: number;
  switch (p.cycle) {
    case SubscriptionCycleEnum.OneMonth:
      monthsPerCycle = 1;
      break;
    case SubscriptionCycleEnum.ThreeMonths:
      monthsPerCycle = 3;
      break;
    case SubscriptionCycleEnum.SixMonths:
      monthsPerCycle = 6;
      break;
    case SubscriptionCycleEnum.OneYear:
      monthsPerCycle = 12;
      break;
    default:
      throw new Error(`Invalid subscription cycle: ${p.cycle}`);
  }

  // 開始日から解約日までの経過月数を計算
  const elapsedMonths = (p.cancelledAt.getFullYear() - p.startedAt.getFullYear()) * 12 + (p.cancelledAt.getMonth() - p.startedAt.getMonth());

  // 現在のサイクル回数を計算（切り捨て）
  const currentCycleNumber = Math.floor(elapsedMonths / monthsPerCycle);

  // 現在のサイクルの終了日を計算
  const expiredAt = new Date(p.startedAt);
  expiredAt.setMonth(expiredAt.getMonth() + (currentCycleNumber + 1) * monthsPerCycle);

  return expiredAt;
};

type SubscriptionCreateProps = Pick<
  SubscriptionEntity,
  'userId' | 'name' | 'price' | 'currency' | 'cycle' | 'startedAt' | 'cancelledAt' | 'description'
>;
const create = (p: SubscriptionCreateProps): SubscriptionEntity => {
  const now = new Date();
  return {
    id: randomUUID(),
    userId: p.userId,
    name: p.name,
    price: p.price,
    currency: p.currency,
    cycle: p.cycle,
    startedAt: p.startedAt,
    cancelledAt: p.cancelledAt ?? null,
    expiredAt: p.cancelledAt ? _calculateExpiredAt({ cycle: p.cycle, startedAt: p.startedAt, cancelledAt: p.cancelledAt }) : null,
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
    return {
      ...updated,
      expiredAt: updated.cancelledAt
        ? _calculateExpiredAt({
            cycle: updated.cycle,
            startedAt: updated.startedAt,
            cancelledAt: updated.cancelledAt,
          })
        : null,
    };
  };

const parseEntity = (data: SelectSubscription) => {
  return subscriptionModelBaseSchema.parse(data);
};

export const Subscription = {
  getStatus,
  getIsInUse,
  getIsCancelled,
  getIsExpired,
  create,
  update,
  parseEntity,
};
