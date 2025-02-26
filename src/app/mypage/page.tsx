import { ProfileForm } from '@/frontend/features/user/components/ProfileForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/frontend/shared/components/ui/card';
import type { CurrentUser } from '@/frontend/shared/types/user';
import { honoClient } from '@/shared/lib/hono/hono';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function getUser(): Promise<CurrentUser> {
  const cookieStore = await cookies();
  const response = await honoClient.api.users.me.$get(
    {},
    {
      headers: { cookie: cookieStore.toString() },
    },
  );
  if (!response.ok) {
    const errorData = await response.json();

    switch (response.status) {
      case 401: {
        redirect('/sign-in');
        break;
      }
      default: {
        throw new Error(errorData.error.detail || '予期せぬエラーが発生しました');
      }
    }
  }

  const userData = await response.json();
  return {
    ...userData,
    createdAt: new Date(userData.createdAt),
    updatedAt: new Date(userData.updatedAt),
  } as CurrentUser;
}

async function updateProfile(nickname: string) {
  'use server';

  const cookieStore = await cookies();
  const res = await honoClient.api.users.me.$patch(
    { json: { nickname } },
    {
      headers: {
        cookie: cookieStore.toString(),
      },
    },
  );

  if (!res.ok) {
    console.error(await res.json());
    throw new Error('プロフィールの更新に失敗しました');
  }
}

export default async function MyPage() {
  const user = await getUser();

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>プロフィール設定</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>読み込み中...</div>}>
            <ProfileForm user={user} onSubmit={updateProfile} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
