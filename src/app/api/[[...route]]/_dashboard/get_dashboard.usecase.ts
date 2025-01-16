import type { DrizzleClient } from '@/lib/db/drizzle';
import { subscriptionsTable } from '@/lib/db/schema';
import type { SelectSubscription } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

type Inject = {
  db: DrizzleClient;
};

type Input = {
  userId: string;
};

type Output = {
  subscriptions: SelectSubscription[];
  totalThisMonth: number;
  upcomingSubscriptions: SelectSubscription[];
};

const findManySubscriptions = async (
  db: DrizzleClient,
  userId: string,
): Promise<SelectSubscription[]> => {
  return db
    .select()
    .from(subscriptionsTable)
    .where(
      and(
        eq(subscriptionsTable.userId, userId),
        isNull(subscriptionsTable.deletedAt),
      ),
    );
};

const calculateTotalAmount = (subscriptions: SelectSubscription[]): number => {
  return subscriptions.reduce((total, sub) => total + Number(sub.price), 0);
};

const getUpcomingSubscriptions = (
  subscriptions: SelectSubscription[],
): SelectSubscription[] => {
  return [...subscriptions]
    .sort(
      (a, b) =>
        new Date(a.nextPaymentAt).getTime() -
        new Date(b.nextPaymentAt).getTime(),
    )
    .slice(0, 2);
};

const run =
  ({ db }: Inject) =>
  async ({ userId }: Input): Promise<Output> => {
    const subscriptions = await findManySubscriptions(db, userId);
    const totalThisMonth = calculateTotalAmount(subscriptions);
    const upcomingSubscriptions = getUpcomingSubscriptions(subscriptions);

    return {
      subscriptions,
      totalThisMonth,
      upcomingSubscriptions,
    };
  };

export const GetDashboardUsecase = { run };
