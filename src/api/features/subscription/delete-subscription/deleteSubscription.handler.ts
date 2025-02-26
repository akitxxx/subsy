import { SubscriptionRepository } from '@/api/shared/domain/subscription';
import { toErrorResponse } from '@/api/shared/error';
import type { HonoEnv } from '@/api/shared/types/hono';
import { checkSessionUser } from '@/api/shared/utils/checkSessionUser';
import { zValidator } from '@hono/zod-validator';
import { createFactory } from 'hono/factory';
import { z } from 'zod';
import { DeleteSubscriptionUsecase } from './deleteSubscription.usecase';

const factory = createFactory<HonoEnv>();

const paramSchema = z.object({
  id: z.string(),
});

export const deleteSubscriptionHandler = factory.createHandlers(zValidator('param', paramSchema), async (c) => {
  try {
    const sessionUser = checkSessionUser(c);
    const db = c.var.db;
    const params = paramSchema.parse(c.req.param());

    await DeleteSubscriptionUsecase.run({ sessionUser, subscriptionRepository: SubscriptionRepository({ db }) })({ subscriptionId: params.id });
    return c.json({}, 200);
  } catch (e) {
    if (e instanceof Error) {
      const errorResponse = toErrorResponse(e);
      return c.json(errorResponse, errorResponse.error.status);
    }
    throw e;
  }
});
