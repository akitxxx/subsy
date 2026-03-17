import { subscriptionViewModelSchema } from '@/shared/domain/subscription/subscription.viewModel';
import { honoClient } from '@/shared/lib/hono/hono';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';

const fetcher = async () => {
  const res = await honoClient.api.subscriptions.$get();
  if (!res.ok) {
    const data = await res.json();
    throw data.error;
  }
  return res.json();
};

export const useGetSubscriptions = () => {
  const { data, error, isLoading, mutate } = useSWR('/api/subscriptions', fetcher);

  const parsedData = useMemo(() => {
    return data?.subscriptions.map((d) => subscriptionViewModelSchema.parse(d)) ?? [];
  }, [data]);

  const refetch = useCallback(() => {
    void mutate();
  }, [mutate]);

  return { data: parsedData, error, isLoading, refetch };
};
