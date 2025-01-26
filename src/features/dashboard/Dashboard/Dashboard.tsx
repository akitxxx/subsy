'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionListCard } from '@/features/subscriptions/SubscriptionListCard';
import { useDashboard } from './useDashboard';

export const Dashboard = () => {
  const {
    subscriptions,
    totalThisMonth,
    upcomingSubscriptions,
    handleSaveSubscription,
    handleDelete,
  } = useDashboard();

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>今月の合計</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              ¥{totalThisMonth.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>次回支払い日が近いサブスク</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {upcomingSubscriptions.map((sub) => (
                <li
                  key={sub.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-secondary"
                >
                  <span className="font-semibold">{sub.name}</span>
                  <span className="font-medium">
                    ¥{Number(sub.price).toLocaleString()} ({sub.nextPaymentAt})
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <SubscriptionListCard
          subscriptions={subscriptions}
          onSave={handleSaveSubscription}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};
