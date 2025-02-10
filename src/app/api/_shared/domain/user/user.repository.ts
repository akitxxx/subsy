import type { DrizzleClient } from '@/lib/db/drizzle';
import type { SelectUserAuth } from '@/lib/db/schema';
import { userAuthsTable, usersTable } from '@/lib/db/schema';
import type { Tx } from '@/types/api/tx';
import { and, eq, isNull } from 'drizzle-orm';
import type { UserEntity } from './user.entity';

type Inject = {
  db: DrizzleClient;
};

export type UserRepository = ReturnType<typeof UserRepository>;

const findCurrentUserByAuthProviderId =
  ({ db }: Inject) =>
  async ({ tx, authProviderId }: { tx?: Tx; authProviderId: string }): Promise<UserEntity> => {
    const dbClient = tx ?? db;

    const [user] = await dbClient
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

const create =
  ({ db }: Inject) =>
  async ({ tx, user }: { tx?: Tx; user: UserEntity & { userAuth: SelectUserAuth } }): Promise<void> => {
    const fCreate = async (tx: Tx) => {
      const [createdUser] = await tx
        .insert(usersTable)
        .values({
          nickname: user.nickname,
        })
        .returning();
      await tx.insert(userAuthsTable).values({
        userId: user.id,
        provider: user.userAuth.provider,
        providerId: user.userAuth.providerId,
      });
      return createdUser;
    };

    tx ? await fCreate(tx) : await db.transaction(fCreate);
  };

const update =
  ({ db }: Inject) =>
  async ({ tx, user }: { tx?: Tx; user: UserEntity }): Promise<void> => {
    const fUpdate = async (tx: Tx) => {
      await tx
        .update(usersTable)
        .set({
          nickname: user.nickname,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, user.id));
    };

    tx ? await fUpdate(tx) : await db.transaction(fUpdate);
  };

export const UserRepository = (inject: Inject) => ({
  findCurrentUserByAuthProviderId: findCurrentUserByAuthProviderId(inject),
  create: create(inject),
  update: update(inject),
});
