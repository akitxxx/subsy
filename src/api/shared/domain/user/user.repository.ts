import { and, eq, isNull } from 'drizzle-orm';
import { Effect } from 'effect';
import { InternalServerError } from '@/api/shared/error/errors';
import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import type { InsertUserAuth } from '@/api/shared/lib/db/schema';
import { userAuthsTable, usersTable } from '@/api/shared/lib/db/schema';
import type { Tx } from '@/api/shared/types/tx';
import { ProviderEnum } from '@/shared/enums/user-auth/provider.enum';
import type { UserEntity } from './user.entity';
import { User } from './user.logic';

type Inject = {
  db: DrizzleClient;
};

const findCurrentUserById =
  ({ db }: Inject) =>
  ({ tx, id }: { tx?: Tx; id: string }): Effect.Effect<UserEntity, InternalServerError> =>
    Effect.tryPromise({
      try: async () => {
        const dbClient = tx ?? db;

        const [user] = await dbClient
          .select()
          .from(usersTable)
          .where(and(eq(usersTable.id, id), isNull(usersTable.deletedAt)))
          .limit(1);

        return User.parseEntity(user);
      },
      catch: () => new InternalServerError('ユーザーの取得に失敗しました'),
    });

const findByLineUserId =
  ({ db }: Inject) =>
  ({ tx, lineUserId }: { tx?: Tx; lineUserId: string }): Effect.Effect<UserEntity, InternalServerError> =>
    Effect.tryPromise({
      try: async () => {
        const dbClient = tx ?? db;

        const [result] = await dbClient
          .select()
          .from(usersTable)
          .innerJoin(userAuthsTable, eq(usersTable.id, userAuthsTable.userId))
          .where(and(eq(userAuthsTable.providerId, lineUserId), eq(userAuthsTable.provider, ProviderEnum.Line)))
          .limit(1);

        return User.parseEntity(result.users);
      },
      catch: () => new InternalServerError('LINE ユーザーの取得に失敗しました'),
    });

const create =
  ({ db }: Inject) =>
  ({ tx, entity }: { tx?: Tx; entity: UserEntity & { userAuth: InsertUserAuth } }): Effect.Effect<void, InternalServerError> =>
    Effect.tryPromise({
      try: async () => {
        const fCreate = async (tx: Tx) => {
          const [createdUser] = await tx
            .insert(usersTable)
            .values({ ...entity })
            .returning();
          await tx.insert(userAuthsTable).values({ ...entity.userAuth });
          return createdUser;
        };

        tx ? await fCreate(tx) : await db.transaction(fCreate);
      },
      catch: () => new InternalServerError('ユーザーの作成に失敗しました'),
    });

const update =
  ({ db }: Inject) =>
  ({ tx, entity }: { tx?: Tx; entity: UserEntity }): Effect.Effect<void, InternalServerError> =>
    Effect.tryPromise({
      try: async () => {
        const fUpdate = async (tx: Tx) => {
          await tx
            .update(usersTable)
            .set({ ...entity })
            .where(eq(usersTable.id, entity.id));
        };

        tx ? await fUpdate(tx) : await db.transaction(fUpdate);
      },
      catch: () => new InternalServerError('ユーザーの更新に失敗しました'),
    });

const findByProviderId =
  ({ db }: Inject) =>
  ({
    tx,
    provider,
    providerId,
  }: {
    tx?: Tx;
    provider: ProviderEnum;
    providerId: string;
  }): Effect.Effect<{ id: string } | null, InternalServerError> =>
    Effect.tryPromise({
      try: async () => {
        const dbClient = tx ?? db;

        const [result] = await dbClient
          .select({ id: usersTable.id })
          .from(usersTable)
          .innerJoin(userAuthsTable, eq(usersTable.id, userAuthsTable.userId))
          .where(and(eq(userAuthsTable.provider, provider), eq(userAuthsTable.providerId, providerId)))
          .limit(1);

        return result ?? null;
      },
      catch: () => new InternalServerError('プロバイダーIDによるユーザーの取得に失敗しました'),
    });

export const UserRepository = {
  new: (inject: Inject) => ({
    findCurrentUserById: findCurrentUserById(inject),
    findByLineUserId: findByLineUserId(inject),
    findByProviderId: findByProviderId(inject),
    create: create(inject),
    update: update(inject),
  }),
};

export type UserRepository = ReturnType<typeof UserRepository.new>;
