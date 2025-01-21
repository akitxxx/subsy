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
});
