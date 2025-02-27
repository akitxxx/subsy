import { randomUUID } from 'node:crypto';
import type { SelectSubscription } from '@/api/shared/lib/db/schema';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { SubscriptionStatusEnum } from '@/shared/enums/subscription/subscriptionStatus.enum';
import { DateUtils } from '@/shared/utils/date.util';
import type { SubscriptionEntity } from './subscription.entity';
import { subscriptionModelBaseSchema } from './subscription.entity';

const getStatus = (e: SubscriptionEntity) => {
  if (getIsExpired(e)) return SubscriptionStatusEnum.Expired;
  if (getIsCancelled(e)) return SubscriptionStatusEnum.Cancelled;
  return SubscriptionStatusEnum.Active;
};

// 現在利用中か(期限が切れしていない)
const getIsInUse = (e: SubscriptionEntity) => (now: Date) => {
  return !getIsExpired(e)(now);
};

// 自動更新キャンセル済みか
const getIsCancelled = (e: SubscriptionEntity) => {
  return e.cancelledAt !== null;
};

// 期限が切れているか
const getIsExpired = (e: SubscriptionEntity) => (now: Date) => {
  return e.expiredAt !== null && e.expiredAt < now;
};

// 次回支払日
const getNextPaymentAt = (e: SubscriptionEntity) => (now: Date) => {
  return _calculateNextPaymentAt({ cycle: e.cycle, startedAt: e.startedAt, now });
};

// 次回支払日を計算
const _calculateNextPaymentAt = (p: { cycle: SubscriptionCycleEnum; startedAt: Date; now: Date }) => {
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

  // 開始日から現在までの経過月数を計算
  const now = p.now;
  const startDate = p.startedAt.getDate();
  const currentDate = now.getDate();

  // 経過月数 = 年の差分（月換算） + 月の差分 - 日付による調整
  // 例1: 2025/1/31 → 2025/2/15 の場合
  //   - 年の差分: 0年 = 0ヶ月
  //   - 月の差分: 2月 - 1月 = 1ヶ月
  //   - 日付調整: 15日 < 31日 なので-1ヶ月
  //   - 結果: 0 + 1 - 1 = 0ヶ月経過
  const elapsedMonths =
    (now.getFullYear() - p.startedAt.getFullYear()) * 12 + // 年の差分を月数に換算
    (now.getMonth() - p.startedAt.getMonth()) + // 月の差分
    (currentDate < startDate ? -1 : 0); // 日付による調整（現在日が開始日より前なら-1ヶ月）

  // 現在のサイクル回数を計算
  const currentCycleNumber = Math.floor(elapsedMonths / monthsPerCycle);

  // 次回支払日を計算（現在のサイクル数 + 1 のサイクルの日付）
  const nextPaymentAt = new Date(p.startedAt);
  nextPaymentAt.setMonth(nextPaymentAt.getMonth() + (currentCycleNumber + 1) * monthsPerCycle);

  // 日付が変わっている場合（月末にずれた場合）は、その月の最終日を設定
  const originalDate = p.startedAt.getDate();
  if (nextPaymentAt.getDate() !== originalDate) {
    nextPaymentAt.setDate(0); // 当月の最終日を設定
  }

  return nextPaymentAt;
};

// 期限切れ日を計算
const _calculateExpiredAt = (p: { cycle: SubscriptionCycleEnum; startedAt: Date; cancelledAt: Date | null }) => {
  if (!p.cancelledAt) return null;
  // キャンセル日を基準に次回支払い日を計算
  const nextPaymentAt = _calculateNextPaymentAt({ cycle: p.cycle, startedAt: p.startedAt, now: p.cancelledAt });
  return new Date(nextPaymentAt.getTime() - 1);
};

type SubscriptionCreateProps = Pick<
  SubscriptionEntity,
  'userId' | 'name' | 'price' | 'currency' | 'cycle' | 'startedAt' | 'cancelledAt' | 'description'
>;
const create = (p: SubscriptionCreateProps): SubscriptionEntity => {
  const now = DateUtils.create.now();
  return {
    ...p,
    id: randomUUID(),
    expiredAt: _calculateExpiredAt({ cycle: p.cycle, startedAt: p.startedAt, cancelledAt: p.cancelledAt }),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};

const update =
  (e: SubscriptionEntity) =>
  (props: Partial<SubscriptionEntity>): SubscriptionEntity => {
    const updated = { ...e, ...props };
    return { ...updated, expiredAt: _calculateExpiredAt({ cycle: updated.cycle, startedAt: updated.startedAt, cancelledAt: updated.cancelledAt }) };
  };

const parseEntity = (data: SelectSubscription) => {
  return subscriptionModelBaseSchema.parse(data);
};

export const Subscription = {
  getStatus,
  getIsInUse,
  getIsCancelled,
  getIsExpired,
  getNextPaymentAt,
  create,
  update,
  parseEntity,
};
