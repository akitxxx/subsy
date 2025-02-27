import type { SubscriptionEntity } from '@/api/shared/domain/subscription';
import { Subscription } from '@/api/shared/domain/subscription';
import type { SubscriptionRepository } from '@/api/shared/domain/subscription';
import type { SessionUser } from '@/api/shared/types/sessionUser';
import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { DateUtils } from '@/shared/utils/date.util';
import { CurrencyUtils } from '@/shared/utils/currency.util';

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
const calculateTotalAmount = async (now: Date, subscriptions: SubscriptionEntity[]): Promise<number> => {
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

  // 各サブスクリプションの金額を合計する
  let total = 0;
  for (const sub of subscriptionsHavePaymentThisMonth) {
    if (sub.currency === CurrencyEnum.USD) {
      // USDの場合はJPYに変換する
      const jpyAmount = await CurrencyUtils.convertUsdToJpy(Number(sub.price));
      total += jpyAmount;
    } else {
      // JPYの場合はそのまま加算
      total += Number(sub.price);
    }
  }
  
  return total;
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
    const subscriptions = await subscriptionRepository.findManyActiveAndRecentlyExpired({ userId: sessionUser.id, now });

    const totalThisMonth = await calculateTotalAmount(now, subscriptions);
    const upcomingSubscriptions = getUpcomingSubscriptions(now, subscriptions);

    return {
      totalThisMonth,
      upcomingSubscriptions,
    };
  };

export const GetDashboardUsecase = { run };
