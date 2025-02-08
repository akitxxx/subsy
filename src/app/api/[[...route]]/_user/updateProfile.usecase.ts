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
    const user = await db.query.usersTable.findFirst({
      where: and(eq(userAuthsTable.providerId, authUser.id), isNull(usersTable.deletedAt)),
    });
    if (!user) throw new NotFoundError('ユーザーが見つかりません');

    const [updatedUser] = await db
      .update(usersTable)
      .set({ nickname, updatedAt: new Date() })
      .where(and(eq(usersTable.id, user.id), isNull(usersTable.deletedAt)))
      .returning();

    return { user: updatedUser };
  };

export const UpdateProfileUsecase = { run };
