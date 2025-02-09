import type { UserRepository } from '@/app/api/_shared/domain/user/user.repository';
import { NotFoundError, UnauthorizedError } from '@/app/api/_shared/lib/error';
import type { DrizzleClient } from '@/lib/db/drizzle';
import type { SelectUser } from '@/lib/db/schema';
import { userAuthsTable, usersTable } from '@/lib/db/schema';
import type { User } from '@supabase/supabase-js';
import { and, eq, isNull } from 'drizzle-orm';

type Inject = {
  authUser: User;
  db: DrizzleClient;
  userRepository: UserRepository;
};

type Input = {
  nickname: string;
};

type Output = {
  user: Omit<SelectUser, 'deletedAt'>;
};

const run =
  ({ db, authUser, userRepository }: Inject) =>
  async ({ nickname }: Input): Promise<Output> => {
    const user = await userRepository.findCurrentUserByAuthProviderId({ authProviderId: authUser.id });

    if (!user) throw new NotFoundError('ユーザーが見つかりません');

    const [updatedUser] = await db
      .update(usersTable)
      .set({ nickname, updatedAt: new Date() })
      .where(and(eq(usersTable.id, user.id), isNull(usersTable.deletedAt)))
      .returning();

    return { user: updatedUser };
  };

export const UpdateProfileUsecase = { run };
