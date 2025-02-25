import type { SubscriptionEntity } from '@/app/api/_shared/domain/subscription/subscription.entity';
import { Subscription } from '@/app/api/_shared/domain/subscription/subscription.logic';
import type { SubscriptionRepository } from '@/app/api/_shared/domain/subscription/subscription.repository';
import { DateUtils } from '@/lib/date.util';
import type { SessionUser } from '@/types/api/sessionUser';

type Inject = {
  sessionUser: SessionUser;
  subscriptionRepository: SubscriptionRepository;
};

type Output = {
  totalThisMonth: number;
  upcomingSubscriptions: SubscriptionEntity[];
};

/**
 * 当月の支払い予定かつ期限切れ予定でないサブスクリプションの合計金額を計算
 * @param now
 * @param subscriptions
 * @returns
 */
const calculateTotalAmount = (now: Date, subscriptions: SubscriptionEntity[]): number => {
  // nextPaymentAtが当月のものかつ、期限切れ予定でないものを合計
  const subscriptionsHavePaymentThisMonth = subscriptions.filter((sub) => {
    const nextPaymentAt = Subscription.getNextPaymentAt(sub)(now);
    // nextPaymentAtが当月のもの
    const subscriptionsHavePaymentThisMonth = DateUtils.compare.isBetween(
      nextPaymentAt,
      DateUtils.create.startOfMonth(now),
      DateUtils.create.endOfMonth(now),
    );
    // 期限切れ予定がない or nextPaymentAtが期限切れ予定より前
    const hasPaymentThisMonth = !sub.expiredAt || DateUtils.compare.isBefore(nextPaymentAt, sub.expiredAt);
    return subscriptionsHavePaymentThisMonth && hasPaymentThisMonth;
  });

  return subscriptionsHavePaymentThisMonth.reduce((total, sub) => {
    return total + Number(sub.price);
  }, 0);
};

/**
 * 次回支払日が近い順にソートして3件取得
 * 次回支払日が2週間以内のものにfilter
 * @param now
 * @param subscriptions
 * @returns
 */
const getUpcomingSubscriptions = (now: Date, subscriptions: SubscriptionEntity[]): SubscriptionEntity[] => {
  return [...subscriptions]
    .sort((a, b) => Subscription.getNextPaymentAt(a)(now).getTime() - Subscription.getNextPaymentAt(b)(now).getTime())
    .filter((sub) => {
      const nextPaymentAt = Subscription.getNextPaymentAt(sub)(now);
      return DateUtils.compare.isBetween(nextPaymentAt, now, DateUtils.modify.addDays(now, 14));
    })
    .slice(0, 3);
};

const run =
  ({ sessionUser, subscriptionRepository }: Inject) =>
  async (): Promise<Output> => {
    const now = DateUtils.create.now();
    const subscriptions = await subscriptionRepository.findManyInUse({ userId: sessionUser.id, now });

    const totalThisMonth = calculateTotalAmount(now, subscriptions);
    const upcomingSubscriptions = getUpcomingSubscriptions(now, subscriptions);

    return {
      totalThisMonth,
      upcomingSubscriptions,
    };
  };

export const GetDashboardUsecase = { run };
