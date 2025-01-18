import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { signIn, signOut, auth, handlers } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
    }),
  ],
});
