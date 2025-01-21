'use server';

import { supabase } from '@/lib/supabase';

export async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: '/dashboard',
    },
  });
}
