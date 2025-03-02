import { randomUUID } from 'node:crypto';
import type { SelectSubscription } from '@/api/shared/lib/db/schema';
import type { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { SubscriptionStatusEnum } from '@/shared/enums/subscription/subscriptionStatus.enum';
import { DateUtils } from '@/shared/utils/date.util';
import { SubscriptionUtils } from '@/shared/utils/subscription.util';
import type { SubscriptionEntity } from './subscription.entity';
import { subscriptionModelBaseSchema } from './subscription.entity';

/**
 * サブスクリプションのステータスを取得
 */
const getStatus = (e: SubscriptionEntity) => (now: Date) => {
  if (getIsExpired(e)(now)) return SubscriptionStatusEnum.Expired;
  if (getIsCancelled(e)) return SubscriptionStatusEnum.Cancelled;
  return SubscriptionStatusEnum.Active;
};

/**
 * 現在利用中か(期限が切れていない)
 */
const getIsInUse = (e: SubscriptionEntity) => (now: Date) => {
  return !getIsExpired(e)(now);
};

/**
 * 自動更新キャンセル済みか
 */
const getIsCancelled = (e: SubscriptionEntity) => {
  return e.cancelledAt !== null;
};

/**
 * 期限が切れているか
 */
const getIsExpired = (e: SubscriptionEntity) => (now: Date) => {
  return e.expiredAt !== null && e.expiredAt < now;
};

/**
 * 次回支払日を取得
 */
const getNextPaymentAt = (e: SubscriptionEntity) => (now: Date) => {
  return _calculateNextPaymentAt({
    cycle: e.cycle,
    startedAt: e.startedAt,
    cancelledAt: e.cancelledAt,
    now,
  });
};

/**
 * 次回支払日を計算
 *
 * @description
 * サブスクリプションのサイクルと開始日から次回支払日を計算します。
 * 次回支払日は常に00:00:00形式でサイクル終了日の翌日を返します。
 * これはexpiredAt（23:59:59.999形式）の1ミリ秒後に相当します。
 */
const _calculateNextPaymentAt = (p: {
  cycle: SubscriptionCycleEnum;
  startedAt: Date;
  cancelledAt: Date | null;
  now: Date;
}): Date => {
  if (p.now <= p.startedAt) return p.startedAt;
  // サイクルに応じて月数を計算
  const monthsPerCycle: number = SubscriptionUtils.calculate.getMonthsFromCycle(p.cycle);
  if (!monthsPerCycle) throw new Error(`Invalid subscription cycle: ${p.cycle}`);

  // 開始日から現在までの経過月数を計算
  const now = p.now;
  const startDate = p.startedAt.getDate();
  const currentDate = now.getDate();

  // 経過月数 = 年の差分（月換算） + 月の差分 - 日付による調整
  const elapsedMonths =
    (now.getFullYear() - p.startedAt.getFullYear()) * 12 + // 年の差分を月数に換算
    (now.getMonth() - p.startedAt.getMonth()) + // 月の差分
    (currentDate < startDate ? -1 : 0); // 日付による調整（現在日が開始日より前なら-1ヶ月）

  // 現在のサイクル回数を計算
  const currentCycleNumber = Math.floor(elapsedMonths / monthsPerCycle);

  // 次回支払日を計算（現在のサイクル数 + 1 のサイクルの日付）
  const nextPaymentAt = DateUtils.modify.addMonths(p.startedAt, (currentCycleNumber + 1) * monthsPerCycle);

  // 日付の調整：元の日付が月末の場合や、日付が存在しない月の場合の処理
  const expectedMonth = (p.startedAt.getMonth() + (currentCycleNumber + 1) * monthsPerCycle) % 12;

  // 実際の月が期待する月と異なる場合（月末調整が必要な場合）
  if (nextPaymentAt.getMonth() !== expectedMonth) {
    // 月の最終日を設定
    nextPaymentAt.setDate(0);
  }

  return nextPaymentAt;
};

/**
 * 期限切れ日を計算
 *
 * @description
 * サブスクリプションのサイクルとキャンセル日から期限切れ日を計算します。
 * 期限切れ日は現在のサイクルの最終日の23:59:59.999形式で設定されます。
 * これはnextPaymentAtの1ミリ秒前に相当します。
 */
const _calculateExpiredAt = (p: {
  cycle: SubscriptionCycleEnum;
  startedAt: Date;
  cancelledAt: Date | null;
}): Date | null => {
  if (!p.cancelledAt) return null;

  const nextPaymentAtFromCancelledAt = _calculateNextPaymentAt({
    cycle: p.cycle,
    startedAt: p.startedAt,
    cancelledAt: p.cancelledAt,
    now: p.cancelledAt,
  });

  // 結果の日付を設定（23:59:59.999形式で日の最終ミリ秒を表現）
  return DateUtils.modify.addMilliseconds(nextPaymentAtFromCancelledAt, -1);
};

/**
 * 指定月内のすべての支払日を取得
 */
const getPaymentDatesInMonth = (e: SubscriptionEntity) => (targetDate: Date) => {
  const startOfMonth = DateUtils.create.startOfMonth(targetDate);
  const endOfMonth = DateUtils.modify.addMilliseconds(DateUtils.create.startOfMonth(DateUtils.modify.addMonths(targetDate, 1)), -1);
  // 前月のendOfMonth
  const prevEndOfMonth = DateUtils.modify.addMilliseconds(startOfMonth, -1);

  /**
   * 再帰的に支払日を収集する内部関数
   * @param currentBaseDate 現在の参照日
   * @param dates 収集された支払日の配列
   * @returns 指定月内のすべての支払日
   */
  const _collectPaymentDatesRecursively = (currentBaseDate: Date, dates: Date[] = [], depth = 0): Date[] => {
    // 最大再帰深度を超えた場合は終了
    if (depth > 100) return dates;

    // 以下、既存のロジック
    const nextPaymentDate = getNextPaymentAt(e)(currentBaseDate);
    console.log({ depth, currentBaseDate, nextPaymentDate });
    if (nextPaymentDate > endOfMonth) return dates;
    return _collectPaymentDatesRecursively(DateUtils.modify.addDays(nextPaymentDate, 1), [...dates, nextPaymentDate], depth + 1);
  };

  // 前月のendOfMonthから収集開始
  return _collectPaymentDatesRecursively(prevEndOfMonth);
};

/**
 * サブスクリプションの新規作成に必要なプロパティ
 */
type SubscriptionCreateProps = Pick<
  SubscriptionEntity,
  'userId' | 'name' | 'price' | 'currency' | 'cycle' | 'startedAt' | 'cancelledAt' | 'description'
>;
/**
 * 新しいサブスクリプションを作成
 */
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

/**
 * サブスクリプションを更新
 */
const update =
  (e: SubscriptionEntity) =>
  (props: Partial<SubscriptionEntity>): SubscriptionEntity => {
    const now = DateUtils.create.now();
    const updated = {
      ...e,
      ...props,
      updatedAt: now,
    };

    return {
      ...updated,
      expiredAt: _calculateExpiredAt({
        cycle: updated.cycle,
        startedAt: updated.startedAt,
        cancelledAt: updated.cancelledAt,
      }),
    };
  };

/**
 * DBからの取得データをエンティティに変換
 */
const parseEntity = (data: SelectSubscription) => {
  return subscriptionModelBaseSchema.parse(data);
};

export const Subscription = {
  getStatus,
  getIsInUse,
  getIsCancelled,
  getIsExpired,
  getNextPaymentAt,
  getPaymentDatesInMonth,
  create,
  update,
  parseEntity,
};
