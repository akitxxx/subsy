import { createSupabaseServerClient } from '@/shared/lib/supabase/supabase';
import { SignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function SignInPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen items-start justify-center pt-32">
      <div className="mt-8 flex justify-center">
        <SignIn withSignUp={false} fallbackRedirectUrl={'/'} unsafeMetadata={{ allowSignupWithOAuth: false }} />
      </div>
    </div>
  );
}
