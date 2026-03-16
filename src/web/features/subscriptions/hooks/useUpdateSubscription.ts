import type { SubscriptionViewModel } from '@/shared/domain/subscription/subscription.viewModel';
import { honoClient } from '@/shared/lib/hono/hono';
import useSWR from 'swr';

const fetcher = async (subscription: SubscriptionViewModel) => {
  const res = await honoClient.api.subscriptions[':id'].$patch({
    param: { id: subscription.id },
    json: {
      ...subscription,
    },
    // eslint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- Hono RPC の型推論がうまくいかないため
  } as unknown as { param: { id: string }; json: typeof subscription });
  return res.json();
};

export const useUpdateSubscription = () => {
  const { mutate } = useSWR('/api/subscriptions');

  const updateSubscription = async ({ subscription }: { subscription: SubscriptionViewModel }) => {
    await fetcher(subscription);
    await mutate();
  };

  return { updateSubscription };
};
