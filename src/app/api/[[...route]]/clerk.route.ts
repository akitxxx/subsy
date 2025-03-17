import { clerkWebhookHandler } from '@/api/features/clerk/webhook/clerkWebhook.handler';
import type { HonoEnv } from '@/api/shared/types/hono';
import { Hono } from 'hono';

const app = new Hono<HonoEnv>();

// Clerk webhookエンドポイント
const route = app.post('/webhook', ...clerkWebhookHandler);

export default route;
