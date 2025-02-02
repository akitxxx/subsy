'use client';

import { Button } from '@/components/ui/button';
import { honoClient } from '@/lib/hono/hono';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

const signUpSchema = z.object({
  nickname: z
    .string()
    .min(2, 'ニックネームは2文字以上で入力してください')
    .max(20, 'ニックネームは20文字以下で入力してください')
    .regex(
      /^[a-zA-Z0-9ぁ-んァ-ン一-龥ー]+$/,
      '使用できない文字が含まれています',
    ),
});

type SignUpSchema = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationError('');

    try {
      // zodによるバリデーション
      const validatedData = signUpSchema.parse({ nickname });

      // APIリクエスト
      await honoClient.api.auth['sign-up'].$post({ json: validatedData });

      router.push('/dashboard');
    } catch (err) {
      if (err instanceof z.ZodError) {
        setValidationError(err.errors[0].message);
      } else {
        setError('ユーザー登録に失敗しました。もう一度お試しください。');
        console.error('Error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center pt-32">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            アカウント登録
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            ニックネームを設定してください
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-700"
            >
              ニックネーム
            </label>
            <div className="mt-1">
              <input
                id="nickname"
                name="nickname"
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="2〜20文字で入力してください"
              />
              {validationError && (
                <p className="mt-1 text-sm text-red-600">{validationError}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !nickname}
            variant="default"
            className="w-full"
          >
            <span className="font-bold">
              {loading ? '登録中...' : '登録する'}
            </span>
          </Button>
        </form>
      </div>
    </div>
  );
}
