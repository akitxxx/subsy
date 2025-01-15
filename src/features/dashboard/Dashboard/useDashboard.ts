import type { Subscription } from '@/types/domains/subscription';
import { useState } from 'react';

export const useDashboard = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: 1,
      name: 'Netflix',
      amount: 1490,
      cycle: '月額',
      nextBillingDate: '2023-07-15',
    },
    {
      id: 2,
      name: 'Spotify',
      amount: 980,
      cycle: '月額',
      nextBillingDate: '2023-07-20',
    },
    {
      id: 3,
      name: 'Amazon Prime',
      amount: 4900,
      cycle: '年額',
      nextBillingDate: '2024-01-01',
    },
  ]);

  const totalThisMonth = subscriptions.reduce(
    (total, sub) => total + sub.amount,
    0,
  );

  const upcomingSubscriptions = subscriptions
    .sort(
      (a, b) =>
        new Date(a.nextBillingDate).getTime() -
        new Date(b.nextBillingDate).getTime(),
    )
    .slice(0, 2);

  const handleSaveSubscription = (subscription: Subscription) => {
    if (subscription.id) {
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === subscription.id ? subscription : sub)),
      );
    } else {
      setSubscriptions((prev) => [
        ...prev,
        { ...subscription, id: Date.now() },
      ]);
    }
  };

  const handleDelete = (id: number) => {
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
  };

  return {
    subscriptions,
    totalThisMonth,
    upcomingSubscriptions,
    handleSaveSubscription,
    handleDelete,
  };
};
