import { SubscriptionRepository } from '@/api/shared/domain/subscription';
import { toErrorResponse } from '@/api/shared/error';
import { mapSubscriptionEntityToViewModel } from '@/api/shared/presentation/view-model/subscription/mapSubscriptionEntityToViewModel';
import type { HonoEnv } from '@/api/shared/types/hono';
import { checkSessionUser } from '@/api/shared/utils/checkSessionUser';
import { zValidator } from '@hono/zod-validator';
import { createFactory } from 'hono/factory';
import { z } from 'zod';
import { createOrUpdateSubscriptionInputSchema } from '../shared/createOrUpdateSubscriptionSchema';
import { UpdateSubscriptionUsecase } from './updateSubscription.usecase';

const factory = createFactory<HonoEnv>();

const paramSchema = z.object({
  id: z.string(),
});

export const updateSubscriptionHandler = factory.createHandlers(
  zValidator('param', paramSchema),
  zValidator('json', createOrUpdateSubscriptionInputSchema),
  async (c) => {
    try {
      const sessionUser = checkSessionUser(c);
      const db = c.var.db;
      const params = paramSchema.parse(c.req.param());
      const input = createOrUpdateSubscriptionInputSchema.parse(await c.req.json());

      const result = await UpdateSubscriptionUsecase.run({ db, sessionUser, subscriptionRepository: SubscriptionRepository({ db }) })({
        ...input,
        subscriptionId: params.id,
      });
      return c.json({ subscription: mapSubscriptionEntityToViewModel(result.subscription) }, 200);
    } catch (e) {
      if (e instanceof Error) {
        const errorResponse = toErrorResponse(e);
        return c.json(errorResponse, errorResponse.error.status);
      }
      throw e;
    }
  },
);
