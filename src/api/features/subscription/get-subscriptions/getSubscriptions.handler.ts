import { Effect } from 'effect';
import { createFactory } from 'hono/factory';
import { SubscriptionRepository } from '@/api/shared/domain/subscription';
import { runEffect } from '@/api/shared/lib/effect/runEffect';
import { mapSubscriptionEntitiesToViewModels } from '@/api/shared/presentation/view-model/subscription/mapSubscriptionEntityToViewModel';
import type { HonoEnv } from '@/api/shared/types/hono';
import { checkSessionUser } from '@/api/shared/utils/checkSessionUser';
import { GetSubscriptionsUsecase } from './getSubscriptions.usecase';

const factory = createFactory<HonoEnv>();

export const getSubscriptionsHandler = factory.createHandlers(async (c) => {
  const sessionUser = checkSessionUser(c);
  const db = c.var.db;

  const effect = GetSubscriptionsUsecase.run({
    db,
    subscriptionRepository: SubscriptionRepository.new({ db }),
  })({ userId: sessionUser.id }).pipe(
    Effect.map((result) => c.json({ subscriptions: mapSubscriptionEntitiesToViewModels(result.subscriptions) }, 200)),
  );

  return runEffect(effect, c);
});
