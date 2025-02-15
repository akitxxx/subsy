import type { UserRepository } from '@/app/api/_shared/domain/user/user.repository';
import { NotFoundError } from '@/app/api/_shared/lib/error';
import type { DrizzleClient } from '@/lib/db/drizzle';
import type { SelectSubscription } from '@/lib/db/schema';
import type { SessionUser } from '@/types/api/sessionUser';
import type { SubscriptionCycleEnum } from '@/types/enums/subscription/subscriptionCycle.enum';
import type { SubscriptionStatusEnum } from '@/types/enums/subscription/subscriptionStatus.enum';
import { Subscription } from '../../../_shared/domain/subscription/subscription.entity';
import { SubscriptionRepository } from '../../../_shared/domain/subscription/subscription.repository';

type Inject = {
  db: DrizzleClient;
  sessionUser: SessionUser;
  userRepository: UserRepository;
};

type Input = {
  name: string;
  price: string;
  cycle: SubscriptionCycleEnum;
  startedAt: Date;
  expiredAt: Date;
  description?: string;
  status: SubscriptionStatusEnum;
};

type Output = {
  subscription: SelectSubscription;
};

const run =
  ({ sessionUser, db, userRepository }: Inject) =>
  async (input: Input): Promise<Output> => {
    const user = await userRepository.findCurrentUserById({ id: sessionUser.id });
    if (!user) throw new NotFoundError('ユーザーが見つかりません');

    const newSubscription = Subscription.newSubscription({
      userId: user.id,
      name: input.name,
      price: input.price,
      cycle: input.cycle,
      startedAt: input.startedAt,
      expiredAt: input.expiredAt,
      description: input.description,
    });
    await SubscriptionRepository({ db }).create({ entity: newSubscription });

    return { subscription: newSubscription };
  };

export const CreateSubscriptionUsecase = { run };
