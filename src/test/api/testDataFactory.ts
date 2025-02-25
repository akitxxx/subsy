import { CurrencyEnum } from '@/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/enums/subscription/subscriptionCycle.enum';
import { ProviderEnum } from '@/enums/user-auth/provider.enum';
import { DateUtils } from '@/lib/date.util';
import type { DrizzleClient } from '@/lib/db/drizzle';
import type { InsertSubscription, InsertUser, InsertUserAuth } from '@/lib/db/schema';
import { subscriptionsTable, userAuthsTable, usersTable } from '@/lib/db/schema';
export const createActiveUser = (db: DrizzleClient) => async (p?: Partial<InsertUser> & { userAuth: Partial<InsertUserAuth> }) => {
  const [user] = await db
    .insert(usersTable)
    .values({
      nickname: 'test',
      ...p,
    })
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
      currency: CurrencyEnum.JPY,
      cycle: SubscriptionCycleEnum.OneMonth,
      startedAt: now,
      expiredAt: DateUtils.modify.addMonths(now, 1),
      ...p,
    })
    .returning();
  return subscription;
};
