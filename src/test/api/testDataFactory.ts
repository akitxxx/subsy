import type { DrizzleClient } from '@/lib/db/drizzle';
import type { InsertUser, InsertUserAuth } from '@/lib/db/schema';
import { userAuthsTable, usersTable } from '@/lib/db/schema';
import { ProviderEnum } from '@/types/enums/provider.enum';

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
    providerId: 'providerId-1',
    ...p?.userAuth,
  });
  return user;
};
