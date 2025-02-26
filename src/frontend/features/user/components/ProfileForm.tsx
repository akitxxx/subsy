'use client';

import { Button } from '@/frontend/shared/components/ui/button';
import { Input } from '@/frontend/shared/components/ui/input';
import { Label } from '@/frontend/shared/components/ui/label';
import type { CurrentUser } from '@/frontend/shared/types/user';
import { useState } from 'react';

export function ProfileForm({
  user,
  onSubmit,
}: {
  user: CurrentUser;
  onSubmit: (nickname: string) => Promise<void>;
}) {
  const [nickname, setNickname] = useState(user.nickname);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(nickname);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nickname">ニックネーム</Label>
        <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} required minLength={1} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '保存中...' : '保存'}
      </Button>
    </form>
  );
}
