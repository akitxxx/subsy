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
    year: 'numeric',
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
              <div className="space-y-3">
                {dashboard.data.upcomingSubscriptions.map((sub) => {
                  const daysRemaining = getDaysRemaining(sub.expiredAt);
                  const isUrgent = daysRemaining <= 3;

                  // 残り日数に基づいて背景色とテキスト色を設定
                  let statusColor = 'bg-gray-100 text-gray-700';
                  if (isUrgent) {
                    statusColor = 'bg-red-100 text-red-700';
                  } else if (daysRemaining <= 7) {
                    statusColor = 'bg-orange-100 text-orange-700';
                  }

                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-lg border border-border/50 hover:border-border transition-all duration-200 hover:shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-base">{sub.name}</h3>
                        <div className={`text-sm font-medium px-2 py-1 rounded-full ${statusColor}`}>
                          {daysRemaining === 0 ? '今日支払い' : daysRemaining < 0 ? `${Math.abs(daysRemaining)}日経過` : `あと${daysRemaining}日`}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarIcon size={14} className="mr-1.5" />
                          <span>{formatDate(sub.expiredAt)}</span>
                        </div>
                        <p className="font-medium text-base">
                          {sub.currency === CurrencyEnum.Usd ? '$' : '¥'}
                          {PriceUtils.display.format(sub.price, sub.currency)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-6 bg-muted/30 rounded-lg">次回支払い日が近いサブスクはありません</div>
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
