import { toErrorResponse } from '@/api/shared/error';
import type { HonoEnv } from '@/api/shared/types/hono';
import { createFactory } from 'hono/factory';
import { LineWebhookUsecase } from './lineWebhook.usecase';

const factory = createFactory<HonoEnv>();

export const lineWebhookHandler = factory.createHandlers(async (c) => {
  try {
    const db = c.var.db;
    const requestBody = await c.req.json();

    // LINE Webhookのリクエストを処理
    const result = await LineWebhookUsecase.run({ db, payload: requestBody })();

    // LINE Platformには常に200 OKを返す必要がある
    return c.json({ message: 'OK' }, 200);
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error('LINE Webhookエラー:', e);
      const errorResponse = toErrorResponse(e);
      return c.json(errorResponse, errorResponse.error.status);
    }
    throw e;
  }
});
