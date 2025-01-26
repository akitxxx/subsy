'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function MyPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [user, setUser] = useState({
    name: 'ユーザー名',
    email: 'user@example.com',
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    // ここに実際のログアウト処理を追加
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ここにプロフィール更新の処理を追加
    alert('プロフィールが更新されました');
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center bg-background">
        <Card>
          <CardHeader>
            <CardTitle>ログアウトしました</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsLoggedIn(true)}>
              ログインページへ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background pt-4">
      <Card>
        <CardHeader>
          <CardTitle>プロフィール設定</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">名前</Label>
              <Input
                id="name"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </div>
            <Button type="submit">更新</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
