import { UserRepository } from '@/api/shared/domain/user';
import { toErrorResponse } from '@/api/shared/error';
import { mapSubscriptionEntityToViewModel } from '@/api/shared/presentation/view-model/subscription/mapSubscriptionEntityToViewModel';
import type { HonoEnv } from '@/api/shared/types/hono';
import { checkSessionUser } from '@/api/shared/utils/checkSessionUser';
import { zValidator } from '@hono/zod-validator';
import { createFactory } from 'hono/factory';
import { createOrUpdateSubscriptionInputSchema } from '../shared/createOrUpdateSubscriptionSchema';
import { CreateSubscriptionUsecase } from './createSubscription.usecase';

const factory = createFactory<HonoEnv>();

export const createSubscriptionHandler = factory.createHandlers(zValidator('json', createOrUpdateSubscriptionInputSchema), async (c) => {
  try {
    const sessionUser = checkSessionUser(c);
    const db = c.var.db;
    const input = createOrUpdateSubscriptionInputSchema.parse(await c.req.json());

    const result = await CreateSubscriptionUsecase.run({ db, sessionUser, userRepository: UserRepository({ db }) })(input);
    return c.json({ subscription: mapSubscriptionEntityToViewModel(result.subscription) }, 201);
  } catch (e) {
    if (e instanceof Error) {
      const errorResponse = toErrorResponse(e);
      return c.json(errorResponse, errorResponse.error.status);
    }
    throw e;
  }
});
