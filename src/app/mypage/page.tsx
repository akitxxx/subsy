import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from '@/features/user/components/ProfileForm';
import type { CurrentUser } from '@/features/user/types/user';
import { honoClient } from '@/lib/hono/hono';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function getUser(): Promise<CurrentUser> {
  const cookieStore = await cookies();
  console.time('getUser');
  const response = await honoClient.api.users.me.$get(
    {},
    {
      headers: { cookie: cookieStore.toString() },
    },
  );
  console.timeEnd('getUser');
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
            <ProfileForm user={user} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
