import { NotFoundError } from '@/app/api/_shared/_error';
import type { DrizzleClient } from '@/lib/db/drizzle';
import type { SelectUser } from '@/lib/db/schema';
import { usersTable } from '@/lib/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

type Inject = {
  db: DrizzleClient;
};

type Input = {
  userId: string;
};

type Output = {
  user: Omit<SelectUser, 'deletedAt'>;
};

const run =
  ({ db }: Inject) =>
  async ({ userId }: Input): Promise<Output> => {
    const [user] = await db
      .select({
        id: usersTable.id,
        nickname: usersTable.nickname,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable)
      .where(and(eq(usersTable.id, userId), isNull(usersTable.deletedAt)));

    if (!user) {
      console.error('ユーザーが見つかりません', { userId });
      throw new NotFoundError(`ユーザー(ID: ${userId})が見つかりません`);
    }

    return { user };
  };

export const GetCurrentUserUsecase = { run };
