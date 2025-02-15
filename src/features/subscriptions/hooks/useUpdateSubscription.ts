import type { SubscriptionViewModel } from '@/domain/subscription/subscription.viewModel';
import { honoClient } from '@/lib/hono/hono';
import useSWR from 'swr';

const fetcher = async (subscription: SubscriptionViewModel) => {
  const res = await honoClient.api.subscriptions[':id'].$patch({
    param: { id: subscription.id },
    json: {
      ...subscription,
    },
  } as unknown as { param: { id: string }; json: typeof subscription }); // MEMO: jsonの部分の型推論うまくいかないので一旦無理矢理
  return res.json();
};

export const useUpdateSubscription = () => {
  const { mutate } = useSWR('/api/subscriptions');

  const updateSubscription = async ({ subscription }: { subscription: SubscriptionViewModel }) => {
    await fetcher(subscription);
    mutate();
  };

  return { updateSubscription };
};
