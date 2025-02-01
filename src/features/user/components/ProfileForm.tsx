'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import type { CurrentUser } from '../types/user';

type ProfileFormProps = {
  user: CurrentUser;
};

export function ProfileForm({ user }: ProfileFormProps) {
  const [formUser, setFormUser] = useState(() => ({
    nickname: user.nickname,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: プロフィール更新の処理を実装
    alert('プロフィールが更新されました');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nickname">ニックネーム</Label>
        <Input
          id="nickname"
          value={formUser.nickname}
          onChange={(e) =>
            setFormUser({ ...formUser, nickname: e.target.value })
          }
        />
      </div>
      <Button type="submit">更新</Button>
    </form>
  );
}
