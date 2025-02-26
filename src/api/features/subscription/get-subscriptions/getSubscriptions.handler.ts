import { SubscriptionRepository } from '@/api/shared/domain/subscription';
import { toErrorResponse } from '@/api/shared/error';
import { mapSubscriptionEntitiesToViewModels } from '@/api/shared/presentation/view-model/subscription/mapSubscriptionEntityToViewModel';
import type { HonoEnv } from '@/api/shared/types/hono';
import { checkSessionUser } from '@/api/shared/utils/checkSessionUser';
import { createFactory } from 'hono/factory';
import { GetSubscriptionsUsecase } from './getSubscriptions.usecase';

const factory = createFactory<HonoEnv>();

export const getSubscriptionsHandler = factory.createHandlers(async (c) => {
  try {
    const sessionUser = checkSessionUser(c);
    const db = c.var.db;
    const result = await GetSubscriptionsUsecase.run({ db, subscriptionRepository: SubscriptionRepository({ db }) })({ userId: sessionUser.id });
    return c.json({ subscriptions: mapSubscriptionEntitiesToViewModels(result.subscriptions) }, 200);
  } catch (e) {
    if (e instanceof Error) {
      const errorResponse = toErrorResponse(e);
      return c.json(errorResponse, errorResponse.error.status);
    }
    throw e;
  }
});
