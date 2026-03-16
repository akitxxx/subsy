import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-start justify-center pt-32">
      <SignIn />
    </div>
  );
}
