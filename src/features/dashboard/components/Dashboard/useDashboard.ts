import { useCreateSubscription } from '@/features/subscriptions/hooks/useCreateSubscription';
import { useGetSubscriptions } from '@/features/subscriptions/hooks/useGetSubscriptions';
import { honoClient } from '@/lib/hono/hono';
import type { Subscription } from '@/types/domains/subscription';
import { handle } from 'hono/vercel';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGetDashboard } from '../../hooks/useGetDashboard';

type DashboardResponse = {
  subscriptions: Subscription[];
  totalThisMonth: number;
  upcomingSubscriptions: Subscription[];
};

type DashboardData = DashboardResponse;

export const useDashboard = () => {
  const [error, setError] = useState<string | null>(null);

  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useGetDashboard();
  const { data: subscriptionsData, isLoading: isSubscriptionsLoading, error: subscriptionsError } = useGetSubscriptions();

  const dashboard = useMemo(() => {
    return {
      subscriptions: subscriptionsData?.subscriptions ?? [],
      totalThisMonth: dashboardData?.totalThisMonth ?? 0,
      upcomingSubscriptions: dashboardData?.upcomingSubscriptions ?? [],
    };
  }, [dashboardData, subscriptionsData]);

  const subscriptions = useMemo(() => {
    return subscriptionsData?.subscriptions ?? [];
  }, [subscriptionsData]);

  const { createSubscription } = useCreateSubscription();

  const handleCreateSubscription = async (subscription: Subscription) => {
    try {
      await createSubscription({ subscription });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'サブスクリプションの作成に失敗しました');
    }
  };

  const handleUpdateSubscription = async (subscription: Subscription) => {
    // try {
    //   await updateSubscription({ subscription });
    // } catch (error) {
    //   setError(error instanceof Error ? error.message : 'サブスクリプションの更新に失敗しました');
    // }
  };

  const handleDeleteSubscription = async (id: string) => {
    // try {
    //   // await deleteSubscription(id);
    // } catch (error) {
    //   setError(error instanceof Error ? error.message : 'サブスクリプションの削除に失敗しました');
    // }
  };

  return {
    dashboard: {
      data: dashboard,
      isDashboardLoading,
      dashboardError,
    },
    subscriptions: {
      data: subscriptions,
      isSubscriptionsLoading,
      subscriptionsError,
    },
    error,
    handleCreateSubscription,
    handleUpdateSubscription,
    handleDeleteSubscription,
  };
};
