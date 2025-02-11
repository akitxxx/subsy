import { UserRepository } from '@/app/api/_shared/domain/user/user.repository';
import { toErrorResponse } from '@/app/api/_shared/lib/error';
import type { HonoEnv } from '@/types/api/hono';
import { SubscriptionCycleEnum } from '@/types/enums/subscription/subscriptionCycle.enum';
import { SubscriptionStatusEnum } from '@/types/enums/subscription/subscriptionStatus.enum';
import { zValidator } from '@hono/zod-validator';
import { type Context, Hono } from 'hono';
import { z } from 'zod';
import { checkSessionUser } from '../../_shared/lib/utils/checkSessionUser';
import { CreateSubscriptionUsecase } from './createSubscription.usecase';

const app = new Hono<HonoEnv>();

const createSubscriptionSchema = z.object({
  name: z.string(),
  price: z.string(),
  cycle: z.nativeEnum(SubscriptionCycleEnum),
  startedAt: z.coerce.date(),
  nextPaymentAt: z.coerce.date(),
  description: z.string().optional(),
  status: z.nativeEnum(SubscriptionStatusEnum),
});

const route = app.post('/', zValidator('json', createSubscriptionSchema), async (c: Context<HonoEnv>) => {
  const sessionUser = checkSessionUser(c);
  const db = c.var.db;
  const input = await c.req.json<z.infer<typeof createSubscriptionSchema>>();

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
