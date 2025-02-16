import { honoClient } from '@/lib/hono/hono';
import { useCallback } from 'react';
import useSWR from 'swr';

const fetcher = async () => {
  const res = await honoClient.api.dashboard.$get();
  if (!res.ok) {
    const data = await res.json();
    throw data.error;
  }
  return res.json();
};

export const useGetDashboard = () => {
  const { data, error, isLoading, mutate } = useSWR('/api/dashboard', fetcher);

  const refetch = useCallback(() => {
    mutate();
  }, [mutate]);

  return { data, error, isLoading, refetch };
};
