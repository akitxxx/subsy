import type { SubscriptionEntity } from '@/app/api/_shared/domain/subscription/subscription.entity';
import { Subscription } from '@/app/api/_shared/domain/subscription/subscription.logic';
import { SubscriptionRepository } from '@/app/api/_shared/domain/subscription/subscription.repository';
import type { UserRepository } from '@/app/api/_shared/domain/user/user.repository';
import { NotFoundError } from '@/app/api/_shared/lib/error';
import type { CurrencyEnum } from '@/enums/currency.enum';
import type { SubscriptionCycleEnum } from '@/enums/subscription/subscriptionCycle.enum';
import type { DrizzleClient } from '@/lib/db/drizzle';
import type { SessionUser } from '@/types/api/sessionUser';

type Inject = {
  db: DrizzleClient;
  sessionUser: SessionUser;
  userRepository: UserRepository;
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
  ({ sessionUser, db, userRepository }: Inject) =>
  async (input: Input): Promise<Output> => {
    const user = await userRepository.findCurrentUserById({ id: sessionUser.id });
    if (!user) throw new NotFoundError('ユーザーが見つかりません');

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
    await SubscriptionRepository({ db }).create({ entity: newSubscription });

    return { subscription: newSubscription };
  };

export const CreateSubscriptionUsecase = { run };
