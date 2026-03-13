import { zValidator } from '@hono/zod-validator';
import { Effect } from 'effect';
import { createFactory } from 'hono/factory';
import { z } from 'zod';
import { SubscriptionRepository } from '@/api/shared/domain/subscription';
import { runEffect } from '@/api/shared/lib/effect/runEffect';
import type { HonoEnv } from '@/api/shared/types/hono';
import { checkSessionUser } from '@/api/shared/utils/checkSessionUser';
import { DeleteSubscriptionUsecase } from './deleteSubscription.usecase';

const factory = createFactory<HonoEnv>();

const paramSchema = z.object({
  id: z.string(),
});

export const deleteSubscriptionHandler = factory.createHandlers(zValidator('param', paramSchema), async (c) => {
  const sessionUser = checkSessionUser(c);
  const db = c.var.db;
  const params = paramSchema.parse(c.req.param());

  const effect = DeleteSubscriptionUsecase.run({
    sessionUser,
    subscriptionRepository: SubscriptionRepository.new({ db }),
  })({ subscriptionId: params.id }).pipe(Effect.map(() => c.json({}, 200)));

  return runEffect(effect, c);
});
