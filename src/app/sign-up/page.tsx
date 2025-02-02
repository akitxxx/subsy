import { SignUpForm } from './_components/form';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-start justify-center pt-32">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            アカウント登録
          </h2>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}
