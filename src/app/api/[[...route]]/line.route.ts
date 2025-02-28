import { lineWebhookHandler } from '@/api/features/line/webhook/lineWebhook.handler';
import type { HonoEnv } from '@/api/shared/types/hono';
import { Hono } from 'hono';

const app = new Hono<HonoEnv>();

const route = app.post('/webhook', ...lineWebhookHandler);

export default route;
