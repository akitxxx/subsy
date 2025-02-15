import type { SubscriptionCreateModel, SubscriptionViewModel } from '@/domain/subscription/subscription.viewModel';
import { useCreateSubscription } from '@/features/subscriptions/hooks/useCreateSubscription';
import { useGetSubscriptions } from '@/features/subscriptions/hooks/useGetSubscriptions';
import { useUpdateSubscription } from '@/features/subscriptions/hooks/useUpdateSubscription';
import { honoClient } from '@/lib/hono/hono';
import { Subscription } from '@supabase/supabase-js';
import { handle } from 'hono/vercel';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGetDashboard } from '../../hooks/useGetDashboard';

type DashboardResponse = {
  subscriptions: SubscriptionViewModel[];
  totalThisMonth: number;
  upcomingSubscriptions: SubscriptionViewModel[];
};

type DashboardData = DashboardResponse;

export const useDashboard = () => {
  const [error, setError] = useState<string | null>(null);

  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useGetDashboard();
  const { data: subscriptionsData, isLoading: isSubscriptionsLoading, error: subscriptionsError } = useGetSubscriptions();

  const dashboard = useMemo(() => {
    return {
      totalThisMonth: dashboardData?.totalThisMonth ?? 0,
      upcomingSubscriptions: dashboardData?.upcomingSubscriptions ?? [],
    };
  }, [dashboardData]);

  const subscriptions: SubscriptionViewModel[] = useMemo(() => {
    return subscriptionsData ?? [];
  }, [subscriptionsData]);

  const { createSubscription } = useCreateSubscription();

  const handleCreateSubscription = async (subscription: SubscriptionCreateModel) => {
    try {
      await createSubscription({ subscription });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'サブスクリプションの作成に失敗しました');
    }
  };

  const { updateSubscription } = useUpdateSubscription();

  const handleUpdateSubscription = async (subscription: SubscriptionViewModel) => {
    try {
      await updateSubscription({ subscription });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'サブスクリプションの更新に失敗しました');
    }
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
