import { honoClient } from '@/lib/hono/hono';
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
  const { data, error, isLoading } = useSWR('/api/subscriptions', fetcher);

  return { data, error, isLoading };
};
