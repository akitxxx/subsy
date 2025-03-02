import type { SubscriptionEntity } from '@/api/shared/domain/subscription';
import { Subscription } from '@/api/shared/domain/subscription';
import type { SubscriptionRepository } from '@/api/shared/domain/subscription';
import type { UserRepository } from '@/api/shared/domain/user';
import { NotFoundError } from '@/api/shared/error';
import { ConflictError } from '@/api/shared/error/errors';
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
  async (input: Input): Promise<Output> => {
    const user = await userRepository.findCurrentUserById({ id: sessionUser.id });
    if (!user) throw new NotFoundError('ユーザーが見つかりません');

    const existingSubscriptionCount = await subscriptionRepository.countByUserIdAndName({ userId: user.id, name: input.name });
    if (existingSubscriptionCount > 0) throw new ConflictError('サブスクリプション名が重複しています');

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
    await subscriptionRepository.create({ entity: newSubscription });

    return { subscription: newSubscription };
  };

export const CreateSubscriptionUsecase = { run };
