import { zValidator } from '@hono/zod-validator';
import { Effect } from 'effect';
import { createFactory } from 'hono/factory';
import { SubscriptionRepository } from '@/api/shared/domain/subscription';
import { UserRepository } from '@/api/shared/domain/user';
import { runEffect } from '@/api/shared/lib/effect/runEffect';
import { mapSubscriptionEntityToViewModel } from '@/api/shared/presentation/view-model/subscription/mapSubscriptionEntityToViewModel';
import type { HonoEnv } from '@/api/shared/types/hono';
import { checkSessionUser } from '@/api/shared/utils/checkSessionUser';
import { createOrUpdateSubscriptionInputSchema } from '../shared/createOrUpdateSubscriptionSchema';
import { CreateSubscriptionUsecase } from './createSubscription.usecase';

const factory = createFactory<HonoEnv>();

export const createSubscriptionHandler = factory.createHandlers(zValidator('json', createOrUpdateSubscriptionInputSchema), async (c) => {
  const sessionUser = checkSessionUser(c);
  const db = c.var.db;
  const input = createOrUpdateSubscriptionInputSchema.parse(await c.req.json());

  const effect = CreateSubscriptionUsecase.run({
    sessionUser,
    userRepository: UserRepository.new({ db }),
    subscriptionRepository: SubscriptionRepository.new({ db }),
  })(input).pipe(Effect.map((result) => c.json({ subscription: mapSubscriptionEntityToViewModel(result.subscription) }, 201)));

  return runEffect(effect, c);
});
