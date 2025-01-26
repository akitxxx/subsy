import { hono } from '@/lib/hono/hono';
import type { Subscription } from '@/types/domains/subscription';
import { useCallback, useEffect, useState } from 'react';

type DashboardData = {
  subscriptions: Subscription[];
  totalThisMonth: number;
  upcomingSubscriptions: Subscription[];
};

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData>({
    subscriptions: [],
    totalThisMonth: 0,
    upcomingSubscriptions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await hono.dashboard.dashboard.get();

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'エラーが発生しました' }));
        throw new Error(errorData.error || 'データの取得に失敗しました');
      }

      const dashboardData = (await response.json()) as DashboardData;
      setData(dashboardData);
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
      if (subscription.id) {
        setData((prev) => ({
          ...prev,
          subscriptions: prev.subscriptions.map((sub) =>
            sub.id === subscription.id ? subscription : sub,
          ),
        }));
      } else {
        setData((prev) => ({
          ...prev,
          subscriptions: [
            ...prev.subscriptions,
            { ...subscription, id: Date.now() },
          ],
        }));
      }
      await fetchDashboardData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'サブスクリプションの保存に失敗しました',
      );
      console.error('Subscription save error:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      // TODO: Implement API call for deleting subscription
      setData((prev) => ({
        ...prev,
        subscriptions: prev.subscriptions.filter((sub) => sub.id !== id),
      }));
      await fetchDashboardData();
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
    ...data,
    isLoading,
    error,
    handleSaveSubscription,
    handleDelete,
    refetch: fetchDashboardData,
  };
};
