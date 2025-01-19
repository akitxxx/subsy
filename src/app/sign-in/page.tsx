import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { signInWithGoogle } from './signInWithGoogle.action';

export default async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div>
      <form action={signInWithGoogle}>
        <button type="submit" className="bg-blue-500 text-white p-2">
          Sign in with Google
        </button>
      </form>
    </div>
  );
}
