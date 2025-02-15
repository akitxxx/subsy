import { ProviderEnum } from '@/enums/user-auth/provider.enum';
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
  const [subscription] = await db
    .insert(subscriptionsTable)
    .values({
      name: 'Test Subscription',
      price: '1000',
      cycle: 'monthly',
      startedAt: new Date(),
      expiredAt: new Date(),
      ...p,
    })
    .returning();
  return subscription;
};
