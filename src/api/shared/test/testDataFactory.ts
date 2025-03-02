import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import type { InsertSubscription, InsertUser, InsertUserAuth } from '@/api/shared/lib/db/schema';
import { subscriptionsTable, userAuthsTable, usersTable } from '@/api/shared/lib/db/schema';
import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { ProviderEnum } from '@/shared/enums/user-auth/provider.enum';
import { DateUtils } from '@/shared/utils/date.util';
export const createActiveUser = (db: DrizzleClient) => async (p?: Partial<InsertUser> & { userAuth: Partial<InsertUserAuth> }) => {
  const [user] = await db
    .insert(usersTable)
    .values({ ...p })
    .returning();
  await db.insert(userAuthsTable).values({
    userId: user.id,
    provider: ProviderEnum.Google,
    providerId: user.id,
    ...p?.userAuth,
  });
  return user;
};

export const createSubscription = (db: DrizzleClient) => async (p: Partial<InsertSubscription> & { userId: string }) => {
  const now = DateUtils.create.now();
  const [subscription] = await db
    .insert(subscriptionsTable)
    .values({
      name: 'Test Subscription',
      price: '1000',
      currency: CurrencyEnum.Jpy,
      cycle: SubscriptionCycleEnum.OneMonth,
      startedAt: now,
      expiredAt: DateUtils.modify.addMonths(now, 1),
      ...p,
    })
    .returning();
  return subscription;
};
