'use client';

import { SubscriptionListCard } from '@/frontend/features/subscriptions/components/SubscriptionListCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/frontend/shared/components/ui/card';
import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { PriceUtils } from '@/shared/utils/price.util';
import { CalendarIcon } from 'lucide-react';
import { useDashboard } from './useDashboard';

// 日付をフォーマットする関数
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '日付なし';

  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
};

// 残り日数を計算する関数
const getDaysRemaining = (dateStr: string | null) => {
  if (!dateStr) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

export const Dashboard = () => {
  const { dashboard, subscriptions, handleCreateSubscription, handleUpdateSubscription, handleDeleteSubscription } = useDashboard();

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>今月の合計</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">¥{dashboard.data.totalThisMonth.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>次回支払い日が近いサブスク</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.data.upcomingSubscriptions.length > 0 ? (
              <div className="divide-y">
                {dashboard.data.upcomingSubscriptions.map((sub) => {
                  const daysRemaining = getDaysRemaining(sub.expiredAt);
                  const isUrgent = daysRemaining <= 3;

                  return (
                    <div key={sub.id} className="py-3 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{sub.name}</h3>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <CalendarIcon size={12} className="mr-1" />
                          <span>{formatDate(sub.expiredAt)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {sub.currency === CurrencyEnum.USD ? '$' : '¥'}
                          {PriceUtils.display.format(sub.price, sub.currency)}
                        </p>
                        <p className={`text-xs mt-1 ${isUrgent ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                          {daysRemaining === 0 ? '今日支払い' : daysRemaining < 0 ? `${Math.abs(daysRemaining)}日経過` : `あと${daysRemaining}日`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-3">次回支払い日が近いサブスクはありません</p>
            )}
          </CardContent>
        </Card>

        <SubscriptionListCard
          subscriptions={subscriptions.data}
          onCreate={handleCreateSubscription}
          onUpdate={handleUpdateSubscription}
          onDelete={handleDeleteSubscription}
        />
      </div>
    </div>
  );
};
