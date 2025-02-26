'use server';

import { createSupabaseServerClient } from '@/shared/lib/supabase/supabase';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}
