'use client';

import { Button } from '@/components/ui/button';
import { honoClient } from '@/lib/hono/hono';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useState } from 'react';
import { z } from 'zod';

const signUpSchema = z.object({
  nickname: z
    .string()
    .min(1, 'ニックネームは必須です')
    .max(20, 'ニックネームは20文字以下で入力してください')
    .regex(
      /^[a-zA-Z0-9ぁ-んァ-ン一-龥ー]+$/,
      '使用できない文字が含まれています',
    ),
});

export const SignUpForm = memo(function SignUpForm() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setValidationError('');

      try {
        const validatedData = signUpSchema.parse({ nickname });
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
    },
    [nickname, router],
  );

  return (
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
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
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
        <span className="font-bold">{loading ? '登録中...' : '登録する'}</span>
      </Button>
    </form>
  );
});
