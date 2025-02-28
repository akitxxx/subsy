import { LineService } from '@/api/shared/lib/line';
import type { HonoEnv } from '@/api/shared/types/hono';
import { createFactory } from 'hono/factory';
import { LineWebhookUsecase } from './lineWebhook.usecase';

const factory = createFactory<HonoEnv>();

export const lineWebhookHandler = factory.createHandlers(async (c) => {
  try {
    const db = c.var.db;
    const rawBody = await c.req.raw.text();
    const signature = c.req.header('x-line-signature');

    const lineService = LineService.new();
    // シグネチャの検証
    if (!lineService.validateSignature(signature, rawBody)) {
      return c.json({ message: 'Invalid signature' }, 401);
    }

    // JSONに変換
    const requestBody = JSON.parse(rawBody);

    // LINE Webhookのリクエストを処理
    await LineWebhookUsecase.run({ db, lineService })({ payload: requestBody });

    // LINE Platformには常に200 OKを返す必要がある
    return c.json({ message: 'OK' }, 200);
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error('LINE Webhookエラー:', e);
      // LINE Platformには常に200 OKを返す必要がある（エラー時も）
      return c.json({ message: 'OK' }, 200);
    }
    throw e;
  }
});
