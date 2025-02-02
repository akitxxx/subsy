import { ConflictError } from '@/app/api/_shared/_error/errors';
import type { DrizzleClient } from '@/lib/db/drizzle';
import { type SelectUser, userAuthsTable, usersTable } from '@/lib/db/schema';
import type { User } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';

type Inject = {
  db: DrizzleClient;
  authUser: User;
};

type Input = {
  idToken: string;
};

type Output = {
  user: SelectUser;
};

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;

if (!GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID is not defined');
}

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const run =
  ({ db, authUser }: Inject) =>
  async ({ idToken }: Input): Promise<Output> => {
    const user = await db
      .select({
        id: usersTable.id,
        nickname: usersTable.nickname,
      })
      .from(userAuthsTable)
      .innerJoin(usersTable, eq(userAuthsTable.userId, usersTable.id))
      .where(eq(userAuthsTable.providerId, authUser.id))
      .then((rows) => rows[0]);

    if (user) {
      throw new ConflictError('すでにユーザー登録済みです');
    }

    const newUser = await db
      .insert(usersTable)
      .values({
        nickname:
          authUser.user_metadata.full_name ||
          authUser.email?.split('@')[0] ||
          'Anonymous User',
      })
      .returning()
      .then((rows) => rows[0]);

    return { user: newUser };
  };

export const GoogleAuthUsecase = { run };
