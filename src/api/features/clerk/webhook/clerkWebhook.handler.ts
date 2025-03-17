import { UserRepository } from '@/api/shared/domain/user';
import type { HonoEnv } from '@/api/shared/types/hono';
import { createFactory } from 'hono/factory';
// NOTE: svixパッケージをインストールする必要があります: npm install svix
import { Webhook } from 'svix';
import { ClerkWebhookUsecase } from './clerkWebhook.usecase';

const factory = createFactory<HonoEnv>();

/**
 * Clerkからのwebhookを処理するハンドラー
 */
export const clerkWebhookHandler = factory.createHandlers(async (c) => {
  try {
    const db = c.var.db;
    const rawBody = await c.req.raw.text();

    // Svixヘッダーを取得
    const svixId = c.req.header('svix-id');
    const svixTimestamp = c.req.header('svix-timestamp');
    const svixSignature = c.req.header('svix-signature');

    // ヘッダーが不足している場合はエラー
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('Clerk Webhookヘッダーが不足しています');
      return c.json({ message: 'Invalid request' }, 400);
    }

    // 環境変数からシークレットを取得
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET環境変数が設定されていません');
      return c.json({ message: 'Server configuration error' }, 500);
    }

    // Webhookの検証
    const wh = new Webhook(webhookSecret);
    let payload: unknown;

    try {
      payload = wh.verify(rawBody, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch (error) {
      console.error('Clerk Webhook検証エラー:', error);
      return c.json({ message: 'Invalid signature' }, 401);
    }

    // JSONに変換
    const requestBody = JSON.parse(rawBody);

    // Clerk Webhookのリクエストを処理
    await ClerkWebhookUsecase.run({
      db,
      userRepository: UserRepository.new({ db }),
    })({ payload: requestBody });

    // 成功レスポンスを返す
    return c.json({ message: 'OK' }, 200);
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error('Clerk Webhookエラー:', e);
      return c.json({ message: 'Internal server error' }, 500);
    }
    throw e;
  }
});
