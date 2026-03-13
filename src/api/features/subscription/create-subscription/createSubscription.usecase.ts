import { Effect } from 'effect';
import type { SubscriptionEntity, SubscriptionRepository } from '@/api/shared/domain/subscription';
import { Subscription } from '@/api/shared/domain/subscription';
import type { UserRepository } from '@/api/shared/domain/user';
import { ConflictError, InternalServerError, NotFoundError } from '@/api/shared/error/errors';
import type { SessionUser } from '@/api/shared/types/sessionUser';
import type { CurrencyEnum } from '@/shared/enums/currency.enum';
import type { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';

type Inject = {
  sessionUser: SessionUser;
  userRepository: UserRepository;
  subscriptionRepository: SubscriptionRepository;
};

type Input = {
  name: string;
  price: string;
  cycle: SubscriptionCycleEnum;
  currency: CurrencyEnum;
  startedAt: Date;
  cancelledAt?: Date | null;
  description?: string | null;
};

type Output = {
  subscription: SubscriptionEntity;
};

const run =
  ({ sessionUser, userRepository, subscriptionRepository }: Inject) =>
  (input: Input): Effect.Effect<Output, NotFoundError | ConflictError | InternalServerError> =>
    Effect.gen(function* () {
      const user = yield* Effect.tryPromise({
        try: () => userRepository.findCurrentUserById({ id: sessionUser.id }),
        catch: () => new InternalServerError('ユーザーの取得に失敗しました'),
      });
      if (!user) return yield* Effect.fail(new NotFoundError('ユーザーが見つかりません'));

      const existingSubscriptionCount = yield* Effect.tryPromise({
        try: () => subscriptionRepository.countByUserIdAndName({ userId: user.id, name: input.name }),
        catch: () => new InternalServerError('サブスクリプションの確認に失敗しました'),
      });
      if (existingSubscriptionCount > 0) return yield* Effect.fail(new ConflictError('サブスクリプション名が重複しています'));

      const newSubscription = Subscription.create({
        userId: user.id,
        name: input.name,
        price: input.price,
        currency: input.currency,
        cycle: input.cycle,
        startedAt: input.startedAt,
        cancelledAt: input.cancelledAt ?? null,
        description: input.description ?? null,
      });
      yield* Effect.tryPromise({
        try: () => subscriptionRepository.create({ entity: newSubscription }),
        catch: () => new InternalServerError('サブスクリプションの作成に失敗しました'),
      });

      return { subscription: newSubscription };
    });

export const CreateSubscriptionUsecase = { run };
