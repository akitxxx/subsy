import { getDrizzleClient } from '@/lib/db/drizzle';
import { userAuthsTable, usersTable } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const dbClient = getDrizzleClient();

export const { signIn, signOut, auth, handlers } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    // async session({ session, token }) {
    //   if (!token.sub) return session;
    //   // DBからユーザー情報を取得
    //   const dbUser = (
    //     await dbClient
    //       .select({
    //         user: usersTable,
    //         userAuth: userAuthsTable,
    //       })
    //       .from(usersTable)
    //       .innerJoin(userAuthsTable, eq(userAuthsTable.userId, usersTable.id))
    //       .where(eq(userAuthsTable.providerId, token.sub))
    //       .limit(1)
    //   )?.[0];
    //   if (dbUser) {
    //     return {
    //       ...session,
    //       user: {
    //         ...session.user,
    //         ...dbUser.user,
    //       },
    //     };
    //   }
    //   // DBにユーザーが存在しない場合は、oauthのsession情報のみ返す
    //   return session;
    // },
  },
});
