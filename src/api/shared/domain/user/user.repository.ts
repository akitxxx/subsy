import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import type { InsertUserAuth } from '@/api/shared/lib/db/schema';
import { userAuthsTable, usersTable } from '@/api/shared/lib/db/schema';
import type { Tx } from '@/api/shared/types/tx';
import { ProviderEnum } from '@/shared/enums/user-auth/provider.enum';
import { and, eq, isNull } from 'drizzle-orm';
import type { UserEntity } from './user.entity';
import { User } from './user.logic';

type Inject = {
  db: DrizzleClient;
};

const findCurrentUserById =
  ({ db }: Inject) =>
  async ({ tx, id }: { tx?: Tx; id: string }): Promise<UserEntity> => {
    const dbClient = tx ?? db;

    const [user] = await dbClient
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, id), isNull(usersTable.deletedAt)))
      .limit(1);

    return User.parseEntity(user);
  };

const findByLineUserId =
  ({ db }: Inject) =>
  async ({ tx, lineUserId }: { tx?: Tx; lineUserId: string }): Promise<UserEntity> => {
    const dbClient = tx ?? db;

    const [result] = await dbClient
      .select()
      .from(usersTable)
      .innerJoin(userAuthsTable, eq(usersTable.id, userAuthsTable.userId))
      .where(and(eq(userAuthsTable.providerId, lineUserId), eq(userAuthsTable.provider, ProviderEnum.Line)))
      .limit(1);

    return User.parseEntity(result.users);
  };

const create =
  ({ db }: Inject) =>
  async ({ tx, entity }: { tx?: Tx; entity: UserEntity & { userAuth: InsertUserAuth } }): Promise<void> => {
    const fCreate = async (tx: Tx) => {
      const [createdUser] = await tx
        .insert(usersTable)
        .values({ ...entity })
        .returning();
      await tx.insert(userAuthsTable).values({ ...entity.userAuth });
      return createdUser;
    };

    tx ? await fCreate(tx) : await db.transaction(fCreate);
  };

const update =
  ({ db }: Inject) =>
  async ({ tx, entity }: { tx?: Tx; entity: UserEntity }): Promise<void> => {
    const fUpdate = async (tx: Tx) => {
      await tx
        .update(usersTable)
        .set({ ...entity })
        .where(eq(usersTable.id, entity.id));
    };

    tx ? await fUpdate(tx) : await db.transaction(fUpdate);
  };

export const UserRepository = (inject: Inject) => ({
  findCurrentUserById: findCurrentUserById(inject),
  findByLineUserId: findByLineUserId(inject),
  create: create(inject),
  update: update(inject),
});

export type UserRepository = ReturnType<typeof UserRepository>;
