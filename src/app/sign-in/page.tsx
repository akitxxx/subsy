import { GoogleSignInButton } from '@/features/auth/GoogleSignInButton';
import { createSupabaseServerClient } from '@/lib/supabase/supabase';
import { redirect } from 'next/navigation';

export default async function SignInPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }
  return (
    <div className="flex min-h-screen items-start justify-center pt-32">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            アカウントにサインイン
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            サービスを利用するにはサインインが必要です
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}
