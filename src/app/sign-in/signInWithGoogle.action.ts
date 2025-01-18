'use server';

import { signIn } from '@/lib/auth/auth';

export async function signInWithGoogle() {
  await signIn('google', { callbackUrl: '/' });
}
