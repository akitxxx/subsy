import type { DrizzleClient } from '@/lib/db/drizzle';
import { userAuthsTable, usersTable } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import type { UserEntity } from './user.entity';

type Inject = {
  db: DrizzleClient;
};

export type UserRepository = ReturnType<typeof UserRepository>;

const findCurrentUserByAuthProviderId =
  ({ db }: Inject) =>
  async ({ authProviderId }: { authProviderId: string }): Promise<UserEntity> => {
    const [user] = await db
      .select({
        id: usersTable.id,
        nickname: usersTable.nickname,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable)
      .innerJoin(userAuthsTable, eq(usersTable.id, userAuthsTable.userId))
      .where(and(eq(userAuthsTable.providerId, authProviderId), isNull(usersTable.deletedAt)))
      .limit(1);

    return user;
  };

export const UserRepository = (inject: Inject) => ({
  findCurrentUserByAuthProviderId: findCurrentUserByAuthProviderId(inject),
});
