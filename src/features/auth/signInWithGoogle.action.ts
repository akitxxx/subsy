'use server';

import { createSupabaseServerClient } from '@/lib/supabase/supabase';
import { redirect } from 'next/navigation';

export async function signInWithGoogle() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { url },
    error,
  } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://subsy.vercel.app/api/auth/callback',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) console.error('Googleログインエラー:', error.message);
  if (!error && url) redirect(url);
}
