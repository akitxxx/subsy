import { SubscriptionRepository } from '@/app/api/_shared/domain/subscription/subscription.repository';
import { UserRepository } from '@/app/api/_shared/domain/user/user.repository';
import { toErrorResponse } from '@/app/api/_shared/lib/error';
import {
  mapSubscriptionEntitiesToViewModels,
  mapSubscriptionEntityToViewModel,
} from '@/app/api/_shared/presentation/view-model/subscription/mapSubscriptionEntityToViewModel';
import type { HonoEnv } from '@/types/api/hono';
import { zValidator } from '@hono/zod-validator';
import { type Context, Hono } from 'hono';
import { checkSessionUser } from '../../../_shared/lib/utils/checkSessionUser';
import { CreateSubscriptionUsecase } from '../application/createSubscription.usecase';
import { GetSubscriptionsUsecase } from '../application/getSubscriptions.usecase';
import { UpdateSubscriptionUsecase } from '../application/updateSubscription.usecase';
import { createSubscriptionInputSchema } from './input/createSubscription.input';
import { updateSubscriptionInputSchema } from './input/updateSubscription.input';

const app = new Hono<HonoEnv>();

const route = app
  .get('/', async (c) => {
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
  })
  .post('/', zValidator('json', createSubscriptionInputSchema), async (c: Context<HonoEnv>) => {
    try {
      const sessionUser = checkSessionUser(c);
      const db = c.var.db;
      const input = createSubscriptionInputSchema.parse(await c.req.json());

      const result = await CreateSubscriptionUsecase.run({ db, sessionUser, userRepository: UserRepository({ db }) })(input);
      return c.json({ subscription: mapSubscriptionEntityToViewModel(result.subscription) }, 201);
    } catch (e) {
      if (e instanceof Error) {
        const errorResponse = toErrorResponse(e);
        return c.json(errorResponse, errorResponse.error.status);
      }
      throw e;
    }
  })
  .patch('/:id', zValidator('json', updateSubscriptionInputSchema), async (c: Context<HonoEnv>) => {
    try {
      const sessionUser = checkSessionUser(c);
      const db = c.var.db;
      const subscriptionId = c.req.param('id');
      const input = updateSubscriptionInputSchema.parse(await c.req.json());

      const result = await UpdateSubscriptionUsecase.run({ db, sessionUser, subscriptionRepository: SubscriptionRepository({ db }) })({
        ...input,
        subscriptionId,
      });
      return c.json({ subscription: mapSubscriptionEntityToViewModel(result.subscription) }, 200);
    } catch (e) {
      if (e instanceof Error) {
        const errorResponse = toErrorResponse(e);
        return c.json(errorResponse, errorResponse.error.status);
      }
      throw e;
    }
  });

export default route;
