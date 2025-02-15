import type { SubscriptionCreateModel } from '@/domain/subscription/subscription.viewModel';
import { honoClient } from '@/lib/hono/hono';
import useSWR from 'swr';

const fetcher = async (subscription: SubscriptionCreateModel) => {
  const res = await honoClient.api.subscriptions.$post({
    json: {
      name: subscription.name,
      price: subscription.price,
      currency: subscription.currency,
      cycle: subscription.cycle,
      startedAt: subscription.startedAt,
      cancelledAt: subscription.cancelledAt,
      expiredAt: subscription.expiredAt,
      description: subscription.description,
    },
  });
  return res.json();
};

export const useCreateSubscription = () => {
  const { mutate } = useSWR('/api/subscriptions');

  const createSubscription = async ({
    subscription,
  }: {
    subscription: SubscriptionCreateModel;
  }) => {
    await fetcher(subscription);
    mutate();
  };

  return { createSubscription };
};
