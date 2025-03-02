import { SubscriptionRepository } from '@/api/shared/domain/subscription';
import { toErrorResponse } from '@/api/shared/error';
import { mapSubscriptionEntitiesToViewModels } from '@/api/shared/presentation/view-model/subscription/mapSubscriptionEntityToViewModel';
import type { HonoEnv } from '@/api/shared/types/hono';
import { checkSessionUser } from '@/api/shared/utils/checkSessionUser';
import { createFactory } from 'hono/factory';
import { GetDashboardUsecase } from './getDashboard.usecase';

const factory = createFactory<HonoEnv>();

export const getDashboardHandler = factory.createHandlers(async (c) => {
  try {
    const sessionUser = checkSessionUser(c);
    const db = c.var.db;

    const result = await GetDashboardUsecase.run({
      sessionUser,
      subscriptionRepository: SubscriptionRepository.new({ db }),
    })();

    return c.json(
      {
        totalThisMonth: result.totalThisMonth,
        upcomingSubscriptions: mapSubscriptionEntitiesToViewModels(result.upcomingSubscriptions),
      },
      200,
    );
  } catch (e) {
    if (e instanceof Error) {
      const errorResponse = toErrorResponse(e);
      return c.json(errorResponse, errorResponse.error.status);
    }
    throw e;
  }
});
