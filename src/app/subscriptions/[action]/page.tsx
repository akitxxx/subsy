'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SubscriptionFormPage({
  params,
}: { params: { action: string } }) {
  const router = useRouter();
  const isEditing = params.action === 'edit';

  const [formData, setFormData] = useState({
    serviceName: '',
    amount: '',
    cycle: '',
    nextBillingDate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ここでフォームデータを送信する処理を実装
    console.log(formData);
    router.push('/subscriptions');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {isEditing ? 'サブスク編集' : 'サブスク登録'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="serviceName">サービス名</Label>
          <Input
            id="serviceName"
            name="serviceName"
            value={formData.serviceName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="amount">金額</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="cycle">支払いサイクル</Label>
          <Select
            name="cycle"
            onValueChange={(value) =>
              setFormData({ ...formData, cycle: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">月額</SelectItem>
              <SelectItem value="yearly">年額</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="nextBillingDate">次回支払い日</Label>
          <Input
            id="nextBillingDate"
            name="nextBillingDate"
            type="date"
            value={formData.nextBillingDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex space-x-4">
          <Button type="submit">{isEditing ? '更新' : '登録'}</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/subscriptions')}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}
