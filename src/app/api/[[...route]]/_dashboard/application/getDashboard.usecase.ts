import type { SubscriptionEntity } from '@/app/api/_shared/domain/subscription/subscription.entity';
import { Subscription } from '@/app/api/_shared/domain/subscription/subscription.logic';
import type { UserRepository } from '@/app/api/_shared/domain/user/user.repository';
import { DateUtils } from '@/lib/date.util';
import type { DrizzleClient } from '@/lib/db/drizzle';
import { subscriptionsTable } from '@/lib/db/schema';
import type { SessionUser } from '@/types/api/sessionUser';
import { and, eq, gt, isNull } from 'drizzle-orm';

type Inject = {
  db: DrizzleClient;
  sessionUser: SessionUser;
  userRepository: UserRepository;
};

type Output = {
  totalThisMonth: number;
  upcomingSubscriptions: SubscriptionEntity[];
};

const findManySubscriptions = async (db: DrizzleClient, userId: string): Promise<SubscriptionEntity[]> => {
  const now = DateUtils.getNow();
  const res = await db
    .select()
    .from(subscriptionsTable)
    .where(and(eq(subscriptionsTable.userId, userId), isNull(subscriptionsTable.deletedAt), gt(subscriptionsTable.expiredAt, now)));
  return res.map(Subscription.parseEntity);
};

const calculateTotalAmount = (subscriptions: SubscriptionEntity[]): number => {
  return subscriptions.reduce((total, sub) => total + Number(sub.price), 0);
};

const getUpcomingSubscriptions = (subscriptions: SubscriptionEntity[]): SubscriptionEntity[] => {
  return [...subscriptions].sort((a, b) => Subscription.getNextPaymentAt(a).getTime() - Subscription.getNextPaymentAt(b).getTime()).slice(0, 2);
};

const run =
  ({ sessionUser, db, userRepository }: Inject) =>
  async (): Promise<Output> => {
    const user = await userRepository.findCurrentUserById({ id: sessionUser.id });
    const subscriptions = await findManySubscriptions(db, user.id);
    const totalThisMonth = calculateTotalAmount(subscriptions);
    const upcomingSubscriptions = getUpcomingSubscriptions(subscriptions);

    return {
      totalThisMonth,
      upcomingSubscriptions,
    };
  };

export const GetDashboardUsecase = { run };
