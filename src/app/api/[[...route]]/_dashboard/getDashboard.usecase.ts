import type { UserRepository } from '@/app/api/_shared/domain/user/user.repository';
import type { DrizzleClient } from '@/lib/db/drizzle';
import { type SelectSubscription, subscriptionsTable } from '@/lib/db/schema';
import type { SessionUser } from '@/types/api/sessionUser';
import { and, eq, isNull } from 'drizzle-orm';

type Inject = {
  authUser: SessionUser;
  db: DrizzleClient;
  userRepository: UserRepository;
};

type Output = {
  subscriptions: SelectSubscription[];
  totalThisMonth: number;
  upcomingSubscriptions: SelectSubscription[];
};

const findManySubscriptions = async (db: DrizzleClient, userId: string): Promise<SelectSubscription[]> => {
  return db
    .select({
      id: subscriptionsTable.id,
      name: subscriptionsTable.name,
      createdAt: subscriptionsTable.createdAt,
      updatedAt: subscriptionsTable.updatedAt,
      deletedAt: subscriptionsTable.deletedAt,
      description: subscriptionsTable.description,
      userId: subscriptionsTable.userId,
      price: subscriptionsTable.price,
      cycle: subscriptionsTable.cycle,
      startedAt: subscriptionsTable.startedAt,
      nextPaymentAt: subscriptionsTable.nextPaymentAt,
      status: subscriptionsTable.status,
    })
    .from(subscriptionsTable)
    .where(and(eq(subscriptionsTable.userId, userId), isNull(subscriptionsTable.deletedAt)));
};

const calculateTotalAmount = (subscriptions: SelectSubscription[]): number => {
  return subscriptions.reduce((total, sub) => total + Number(sub.price), 0);
};

const getUpcomingSubscriptions = (subscriptions: SelectSubscription[]): SelectSubscription[] => {
  return [...subscriptions].sort((a, b) => new Date(a.nextPaymentAt).getTime() - new Date(b.nextPaymentAt).getTime()).slice(0, 2);
};

const run =
  ({ authUser, db, userRepository }: Inject) =>
  async (): Promise<Output> => {
    const user = await userRepository.findCurrentUserByAuthProviderId({ authProviderId: authUser.id });
    const subscriptions = await findManySubscriptions(db, user.id);
    const totalThisMonth = calculateTotalAmount(subscriptions);
    const upcomingSubscriptions = getUpcomingSubscriptions(subscriptions);

    return {
      subscriptions,
      totalThisMonth,
      upcomingSubscriptions,
    };
  };

export const GetDashboardUsecase = { run };
