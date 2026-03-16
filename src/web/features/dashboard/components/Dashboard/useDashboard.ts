import type { SubscriptionCreateModel, SubscriptionViewModel } from '@/shared/domain/subscription/subscription.viewModel';
import { useCreateSubscription } from '@/web/features/subscriptions/hooks/useCreateSubscription';
import { useDeleteSubscription } from '@/web/features/subscriptions/hooks/useDeleteSubscription';
import { useGetSubscriptions } from '@/web/features/subscriptions/hooks/useGetSubscriptions';
import { useUpdateSubscription } from '@/web/features/subscriptions/hooks/useUpdateSubscription';
import { useMemo, useState } from 'react';
import { useGetDashboard } from '../../hooks/useGetDashboard';

export const useDashboard = () => {
  const [error, setError] = useState<string | null>(null);

  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError, refetch: refetchDashboard } = useGetDashboard();
  const {
    data: subscriptionsData,
    isLoading: isSubscriptionsLoading,
    error: subscriptionsError,
    refetch: refetchSubscriptions,
  } = useGetSubscriptions();

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
      refetchDashboard();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'サブスクリプションの作成に失敗しました');
    }
  };

  const { updateSubscription } = useUpdateSubscription();

  const handleUpdateSubscription = async (subscription: SubscriptionViewModel) => {
    try {
      await updateSubscription({ subscription });
      refetchDashboard();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'サブスクリプションの更新に失敗しました');
    }
  };

  const { deleteSubscription } = useDeleteSubscription();

  const handleDeleteSubscription = async (subscription: SubscriptionViewModel) => {
    try {
      await deleteSubscription({ subscriptionId: subscription.id });
      refetchDashboard();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'サブスクリプションの削除に失敗しました');
    }
  };

  return {
    dashboard: {
      data: dashboard,
      isDashboardLoading,
      dashboardError,
      refetchDashboard,
    },
    subscriptions: {
      data: subscriptions,
      isSubscriptionsLoading,
      subscriptionsError,
      refetchSubscriptions,
    },
    error,
    handleCreateSubscription,
    handleUpdateSubscription,
    handleDeleteSubscription,
  };
};
