import { Effect } from 'effect';
import type { SubscriptionEntity, SubscriptionRepository } from '@/api/shared/domain/subscription';
import { InternalServerError } from '@/api/shared/error/errors';
import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import { DateUtils } from '@/shared/utils/date.util';

type Inject = {
  db: DrizzleClient;
  subscriptionRepository: SubscriptionRepository;
};

type Input = {
  userId: string;
};

type Output = {
  subscriptions: SubscriptionEntity[];
};

const run = ({ subscriptionRepository }: Inject) => {
  return (p: Input): Effect.Effect<Output, InternalServerError> =>
    Effect.gen(function* () {
      const now = DateUtils.create.now();
      const subscriptions = yield* Effect.tryPromise({
        try: () => subscriptionRepository.findManyActiveAndRecentlyExpired({ userId: p.userId, now }),
        catch: () => new InternalServerError('サブスクリプションの取得に失敗しました'),
      });
      return { subscriptions };
    });
};

export const GetSubscriptionsUsecase = { run };
