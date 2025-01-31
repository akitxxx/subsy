import { honoClient } from '@/lib/hono/hono';
import type { Subscription } from '@/types/domains/subscription';
import { useCallback, useEffect, useState } from 'react';

type DashboardResponse = {
  subscriptions: Subscription[];
  totalThisMonth: number;
  upcomingSubscriptions: Subscription[];
};

type DashboardData = DashboardResponse;

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await honoClient.api.dashboard.$get();

      if (res.ok) {
        const data = await res.json();
        setData(data);
        return data;
      }

      if (res.status === 500) {
        const data = await res.json();
        setError(data.error.detail);
        return data;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初回マウント時にデータを取得
  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSaveSubscription = async (subscription: Subscription) => {
    try {
      setError(null);
      // TODO: Implement API call for saving subscription
      setData((prev) => {
        if (!prev) return prev;
        if (subscription.id) {
          return {
            ...prev,
            subscriptions: prev.subscriptions.map((sub) =>
              sub.id === subscription.id ? subscription : sub,
            ),
          };
        }
        return {
          ...prev,
          subscriptions: [...prev.subscriptions, subscription],
        };
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'サブスクリプションの保存に失敗しました',
      );
      console.error('Subscription save error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      // TODO: Implement API call for deleting subscription
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          subscriptions: prev.subscriptions.filter((sub) => sub.id !== id),
        };
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'サブスクリプションの削除に失敗しました',
      );
      console.error('Subscription delete error:', err);
    }
  };

  return {
    subscriptions: data?.subscriptions ?? [],
    totalThisMonth: data?.totalThisMonth ?? 0,
    upcomingSubscriptions: data?.upcomingSubscriptions ?? [],
    isLoading,
    error,
    handleSaveSubscription,
    handleDelete,
    refetch: fetchDashboardData,
  };
};
