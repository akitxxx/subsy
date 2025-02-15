import type { SubscriptionEntity } from '@/app/api/_shared/domain/subscription/subscription.entity';
import { Subscription } from '@/app/api/_shared/domain/subscription/subscription.logic';
import { SubscriptionRepository } from '@/app/api/_shared/domain/subscription/subscription.repository';
import { NotFoundError } from '@/app/api/_shared/lib/error/errors';
import type { CurrencyEnum } from '@/enums/currency.enum';
import type { SubscriptionCycleEnum } from '@/enums/subscription/subscriptionCycle.enum';
import type { DrizzleClient } from '@/lib/db/drizzle';
import type { SessionUser } from '@/types/api/sessionUser';

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
  expiredAt: Date;
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
      expiredAt: input.expiredAt,
      description: input.description,
    });

    await SubscriptionRepository({ db }).update({ entity: updatedSubscription });

    return { subscription: updatedSubscription };
  };

export const UpdateSubscriptionUsecase = { run };
