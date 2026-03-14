import { Effect } from 'effect';
import type { SubscriptionEntity } from '@/api/shared/domain/subscription';
import { Subscription } from '@/api/shared/domain/subscription';
import type { SubscriptionRepository } from '@/api/shared/domain/subscription/subscription.repository';
import { type InternalServerError, NotFoundError } from '@/api/shared/error/errors';
import type { SessionUser } from '@/api/shared/types/sessionUser';
import type { CurrencyEnum } from '@/shared/enums/currency.enum';
import type { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';

type Inject = {
  sessionUser: SessionUser;
  subscriptionRepository: SubscriptionRepository;
};

type Input = {
  subscriptionId: string;
  name: string;
  price: string;
  currency: CurrencyEnum;
  cycle: SubscriptionCycleEnum;
  startedAt: Date;
  cancelledAt: Date | null;
  description: string | null;
};

type Output = {
  subscription: SubscriptionEntity;
};

const run =
  ({ sessionUser, subscriptionRepository }: Inject) =>
  (input: Input): Effect.Effect<Output, NotFoundError | InternalServerError> =>
    Effect.gen(function* () {
      const subscription = yield* subscriptionRepository.findByIdAndUserId({ id: input.subscriptionId, userId: sessionUser.id });
      if (!subscription) return yield* Effect.fail(new NotFoundError('サブスクリプションが見つかりません'));

      const updatedSubscription = Subscription.update(subscription)({
        name: input.name,
        price: input.price,
        currency: input.currency,
        cycle: input.cycle,
        startedAt: input.startedAt,
        cancelledAt: input.cancelledAt,
        description: input.description,
      });

      yield* subscriptionRepository.update({ entity: updatedSubscription });

      return { subscription: updatedSubscription };
    });

export const UpdateSubscriptionUsecase = { run };
