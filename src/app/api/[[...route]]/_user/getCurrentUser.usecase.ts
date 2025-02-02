import { NotFoundError, UnauthorizedError } from '@/app/api/_shared/_error';
import type { DrizzleClient } from '@/lib/db/drizzle';
import type { SelectUser } from '@/lib/db/schema';
import { userAuthsTable, usersTable } from '@/lib/db/schema';
import type { User } from '@supabase/supabase-js';
import { and, eq, isNull } from 'drizzle-orm';

type Inject = {
  db: DrizzleClient;
  authUser: User | null;
};

type Output = {
  user: Omit<SelectUser, 'deletedAt'>;
};

const run =
  ({ db, authUser }: Inject) =>
  async (): Promise<Output> => {
    const [user] = await db
      .select({
        id: usersTable.id,
        nickname: usersTable.nickname,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable)
      .innerJoin(userAuthsTable, eq(usersTable.id, userAuthsTable.userId))
      .where(
        and(
          eq(userAuthsTable.providerId, authUser?.id || ''),
          isNull(usersTable.deletedAt),
        ),
      )
      .limit(1);

    if (!user) {
      console.error('ユーザーが見つかりません', { authUserId: authUser?.id });
      throw new NotFoundError('ユーザーが見つかりません');
    }

    return { user };
  };

export const GetCurrentUserUsecase = { run };
