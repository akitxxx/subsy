import type { SubscriptionEntity } from '@/api/shared/domain/subscription';
import { Subscription } from '@/api/shared/domain/subscription';
import { SubscriptionRepository } from '@/api/shared/domain/subscription';
import { NotFoundError } from '@/api/shared/error/errors';
import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import type { SessionUser } from '@/api/shared/types/sessionUser';
import type { CurrencyEnum } from '@/shared/enums/currency.enum';
import type { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';

type Inject = {
  db: DrizzleClient;
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
  ({ sessionUser, db, subscriptionRepository }: Inject) =>
  async (input: Input): Promise<Output> => {
    const subscription = await subscriptionRepository.findByIdAndUserId({ id: input.subscriptionId, userId: sessionUser.id });
    if (!subscription) throw new NotFoundError('サブスクリプションが見つかりません');

    const updatedSubscription = Subscription.update(subscription)({
      name: input.name,
      price: input.price,
      currency: input.currency,
      cycle: input.cycle,
      startedAt: input.startedAt,
      cancelledAt: input.cancelledAt,
      description: input.description,
    });

    await SubscriptionRepository({ db }).update({ entity: updatedSubscription });

    return { subscription: updatedSubscription };
  };

export const UpdateSubscriptionUsecase = { run };
