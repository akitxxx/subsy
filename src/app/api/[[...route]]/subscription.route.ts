import { createSubscriptionHandler } from '@/api/features/subscription/create-subscription/createSubscription.handler';
import { deleteSubscriptionHandler } from '@/api/features/subscription/delete-subscription/deleteSubscription.handler';
import { getSubscriptionsHandler } from '@/api/features/subscription/get-subscriptions/getSubscriptions.handler';
import { updateSubscriptionHandler } from '@/api/features/subscription/update-subscription/updateSubscription.handler';
import type { HonoEnv } from '@/api/shared/types/hono';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

const app = new Hono<HonoEnv>();

const route = app
  .get('/', ...getSubscriptionsHandler)
  .post('/', ...createSubscriptionHandler)
  .patch('/:id', ...updateSubscriptionHandler)
  .delete('/:id', ...deleteSubscriptionHandler);

export default route;
