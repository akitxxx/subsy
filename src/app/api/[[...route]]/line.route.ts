import { lineWebhookHandler } from '@/api/features/line/webhook/lineWebhook.handler';
import { LineService } from '@/api/shared/lib/line';
import { Hono } from 'hono';

const app = new Hono<LineContext>();

// context
app.use(async (c, next) => {
  // inject
  const lineClient = LineService.createMessagingApiClient();
  c.set('lineClient', lineClient);

  await next();
});

const route = app.post('/webhook', ...lineWebhookHandler);

export default route;
