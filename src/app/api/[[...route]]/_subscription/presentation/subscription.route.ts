import { UserRepository } from '@/app/api/_shared/domain/user/user.repository';
import { toErrorResponse } from '@/app/api/_shared/lib/error';
import type { HonoEnv } from '@/types/api/hono';
import { zValidator } from '@hono/zod-validator';
import { type Context, Hono } from 'hono';
import { checkSessionUser } from '../../../_shared/lib/utils/checkSessionUser';
import { CreateSubscriptionUsecase } from '../application/createSubscription.usecase';
import { createSubscriptionSchema } from './input/createSubscription.input';

const app = new Hono<HonoEnv>();

const route = app.post('/', zValidator('json', createSubscriptionSchema), async (c: Context<HonoEnv>) => {
  const sessionUser = checkSessionUser(c);
  const db = c.var.db;
  const input = createSubscriptionSchema.parse(await c.req.json());

  try {
    const result = await CreateSubscriptionUsecase.run({ db, sessionUser, userRepository: UserRepository({ db }) })(input);
    return c.json(result, 201);
  } catch (e) {
    if (e instanceof Error) {
      const errorResponse = toErrorResponse(e);
      return c.json(errorResponse, errorResponse.error.status);
    }
    throw e;
  }
});

export default route;
