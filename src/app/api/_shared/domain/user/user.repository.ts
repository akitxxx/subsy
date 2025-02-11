import type { DrizzleClient } from '@/lib/db/drizzle';
import type { InsertUserAuth, SelectUserAuth } from '@/lib/db/schema';
import { userAuthsTable, usersTable } from '@/lib/db/schema';
import type { Tx } from '@/types/api/tx';
import { and, eq, isNull } from 'drizzle-orm';
import type { UserEntity } from './user.entity';

type Inject = {
  db: DrizzleClient;
};

export type UserRepository = ReturnType<typeof UserRepository>;

const findCurrentUserById =
  ({ db }: Inject) =>
  async ({ tx, id }: { tx?: Tx; id: string }): Promise<UserEntity> => {
    const dbClient = tx ?? db;

    const [user] = await dbClient
      .select({
        id: usersTable.id,
        nickname: usersTable.nickname,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    return user;
  };

const create =
  ({ db }: Inject) =>
  async ({ tx, user }: { tx?: Tx; user: UserEntity & { userAuth: InsertUserAuth } }): Promise<void> => {
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
  findCurrentUserById: findCurrentUserById(inject),
  create: create(inject),
  update: update(inject),
});
