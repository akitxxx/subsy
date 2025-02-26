import { honoClient } from '@/shared/lib/hono/hono';
import useSWR from 'swr';

const fetcher = async (subscriptionId: string) => {
  const res = await honoClient.api.subscriptions[':id'].$delete({ param: { id: subscriptionId } });
  return res.json();
};

export const useDeleteSubscription = () => {
  const { mutate } = useSWR('/api/subscriptions');

  const deleteSubscription = async ({ subscriptionId }: { subscriptionId: string }) => {
    await fetcher(subscriptionId);
    mutate();
  };

  return { deleteSubscription };
};
