import { honoClient } from '@/lib/hono/hono';
import type { Subscription } from '@/types/domains/subscription';
import useSWR from 'swr';

const fetcher = async (subscription: Subscription) => {
  const res = await honoClient.api.subscriptions.$post({
    json: {
      name: subscription.name,
      price: subscription.price,
      startedAt: subscription.startedAt,
    },
  });
  return res.json();
};

export const useCreateSubscription = () => {
  const { mutate } = useSWR('/api/subscriptions');

  const createSubscription = async ({
    subscription,
  }: {
    subscription: Subscription;
  }) => {
    await fetcher(subscription);
    mutate();
  };

  return { createSubscription };
};
