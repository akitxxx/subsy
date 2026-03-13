import { Effect } from 'effect';
import { createFactory } from 'hono/factory';
import { SubscriptionRepository } from '@/api/shared/domain/subscription';
import { runEffect } from '@/api/shared/lib/effect/runEffect';
import { mapSubscriptionEntitiesToViewModels } from '@/api/shared/presentation/view-model/subscription/mapSubscriptionEntityToViewModel';
import type { HonoEnv } from '@/api/shared/types/hono';
import { checkSessionUser } from '@/api/shared/utils/checkSessionUser';
import { GetDashboardUsecase } from './getDashboard.usecase';

const factory = createFactory<HonoEnv>();

export const getDashboardHandler = factory.createHandlers(async (c) => {
  const sessionUser = checkSessionUser(c);
  const db = c.var.db;

  const effect = GetDashboardUsecase.run({
    sessionUser,
    subscriptionRepository: SubscriptionRepository.new({ db }),
  })().pipe(
    Effect.map((result) =>
      c.json(
        {
          totalThisMonth: result.totalThisMonth,
          upcomingSubscriptions: mapSubscriptionEntitiesToViewModels(result.upcomingSubscriptions),
        },
        200,
      ),
    ),
  );

  return runEffect(effect, c);
});
