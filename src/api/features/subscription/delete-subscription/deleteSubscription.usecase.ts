import { Effect } from 'effect';
import type { SubscriptionRepository } from '@/api/shared/domain/subscription';
import { InternalServerError } from '@/api/shared/error/errors';
import type { SessionUser } from '@/api/shared/types/sessionUser';

type Inject = {
  sessionUser: SessionUser;
  subscriptionRepository: SubscriptionRepository;
};

type Input = {
  subscriptionId: string;
};

const run =
  ({ sessionUser, subscriptionRepository }: Inject) =>
  ({ subscriptionId }: Input): Effect.Effect<void, InternalServerError> =>
    Effect.gen(function* () {
      yield* Effect.tryPromise({
        try: () => subscriptionRepository.delete({ id: subscriptionId, userId: sessionUser.id }),
        catch: () => new InternalServerError('サブスクリプションの削除に失敗しました'),
      });
    });

export const DeleteSubscriptionUsecase = { run };
