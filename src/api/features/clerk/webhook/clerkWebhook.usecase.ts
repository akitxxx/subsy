import { CreateUserDomainService } from '@/api/shared/domain/user/createUser.domainService';
import type { UserRepository } from '@/api/shared/domain/user/user.repository';
import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import { ProviderEnum } from '@/shared/enums/user-auth/provider.enum';

type Inject = {
  db: DrizzleClient;
  userRepository: UserRepository;
};

type Input = {
  payload: ClerkWebhookPayload;
};

type Output = {
  success: boolean;
};

/**
 * Clerk Webhookペイロード型
 */
type ClerkWebhookPayload = {
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name?: string;
    last_name?: string;
    username?: string;
    // 他のフィールドも必要に応じて追加
  };
  object: string;
  type: string;
  timestamp: number;
  instance_id: string;
};

/**
 * Clerk Webhookを処理するユースケース
 */
const run =
  (inject: Inject) =>
  async ({ payload }: Input): Promise<Output> => {
    console.dir({ 'ClerkWebhookUsecase.run': payload }, { depth: null });

    // イベントタイプの確認
    if (payload.type !== 'user.created') {
      console.log(`サポートされていないイベントタイプ: ${payload.type}`);
      return { success: true }; // サポートされていないイベントでもエラーにはしない
    }

    try {
      // user.createdイベントの処理
      const userData = payload.data;

      // ユーザーIDの取得
      const clerkUserId = userData.id;
      if (!clerkUserId) {
        console.error('Clerk user IDが見つかりません');
        return { success: false };
      }

      // ユーザーの作成
      await CreateUserDomainService.run({ userRepository: inject.userRepository })({
        provider: ProviderEnum.Google, // Clerkの場合はGoogleとして登録
        providerId: clerkUserId,
      });

      console.log(`ユーザーが作成されました: ${clerkUserId}`);
      return { success: true };
    } catch (error) {
      console.error('Clerk Webhookユーザー作成エラー:', error);
      return { success: false };
    }
  };

export const ClerkWebhookUsecase = { run };
