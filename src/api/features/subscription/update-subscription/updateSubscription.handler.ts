import { zValidator } from '@hono/zod-validator';
import { Effect } from 'effect';
import { createFactory } from 'hono/factory';
import { z } from 'zod';
import { SubscriptionRepository } from '@/api/shared/domain/subscription';
import { runEffect } from '@/api/shared/lib/effect/runEffect';
import { mapSubscriptionEntityToViewModel } from '@/api/shared/presentation/view-model/subscription/mapSubscriptionEntityToViewModel';
import type { HonoEnv } from '@/api/shared/types/hono';
import { checkSessionUser } from '@/api/shared/utils/checkSessionUser';
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
    const sessionUser = checkSessionUser(c);
    const db = c.var.db;
    const params = paramSchema.parse(c.req.param());
    const input = createOrUpdateSubscriptionInputSchema.parse(await c.req.json());

    const effect = UpdateSubscriptionUsecase.run({
      sessionUser,
      subscriptionRepository: SubscriptionRepository.new({ db }),
    })({
      ...input,
      subscriptionId: params.id,
    }).pipe(Effect.map((result) => c.json({ subscription: mapSubscriptionEntityToViewModel(result.subscription) }, 200)));

    return runEffect(effect, c);
  },
);
