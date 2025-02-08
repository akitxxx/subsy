import { NotFoundError, UnauthorizedError } from '@/app/api/_shared/_error';
import type { DrizzleClient } from '@/lib/db/drizzle';
import type { SelectUser } from '@/lib/db/schema';
import { userAuthsTable, usersTable } from '@/lib/db/schema';
import type { User } from '@supabase/supabase-js';
import { and, eq, isNull } from 'drizzle-orm';

type Inject = {
  db: DrizzleClient;
  authUser: User;
};

type Input = {
  nickname: string;
};

type Output = {
  user: Omit<SelectUser, 'deletedAt'>;
};

const run =
  ({ db, authUser }: Inject) =>
  async ({ nickname }: Input): Promise<Output> => {
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        nickname,
        updatedAt: new Date(),
      })
      .where(and(eq(usersTable.id, authUser.id), isNull(usersTable.deletedAt)))
      .returning({
        id: usersTable.id,
        nickname: usersTable.nickname,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      });

    if (!updatedUser) {
      throw new NotFoundError('ユーザーが見つかりません');
    }

    return { user: updatedUser };
  };

export const UpdateProfileUsecase = { run };
