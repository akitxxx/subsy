import type { DrizzleClient } from '@/api/shared/lib/db/drizzle';
import type {
  DeleteSubscriptionFunctionArgs,
  GetSubscriptionDetailFunctionArgs,
  SubscriptionFunctionArgs,
  UpdateSubscriptionFunctionArgs,
} from '@/api/shared/lib/openai';
import { FunctionName } from '@/api/shared/lib/openai/subscription-functions';

/**
 * 機能名に応じた処理を実行
 */
export const executeFunctionByName = async (db: DrizzleClient, functionCall: { name: string; args: unknown }): Promise<string> => {
  const { name, args } = functionCall;

  switch (name) {
    case FunctionName.createSubscription:
      return handleCreateSubscription(db, args as SubscriptionFunctionArgs);
    case FunctionName.getSubscriptions:
      return handleGetSubscriptions(db);
    case FunctionName.getSubscriptionDetail:
      return handleGetSubscriptionDetail(db, args as GetSubscriptionDetailFunctionArgs);
    case FunctionName.updateSubscription:
      return handleUpdateSubscription(db, args as UpdateSubscriptionFunctionArgs);
    case FunctionName.deleteSubscription:
      return handleDeleteSubscription(db, args as DeleteSubscriptionFunctionArgs);
    default:
      throw new Error(`未知の機能: ${name}`);
  }
};

/**
 * サブスクリプション作成処理
 */
const handleCreateSubscription = async (db: DrizzleClient, args: SubscriptionFunctionArgs): Promise<string> => {
  console.log('サブスクリプション作成:', args);
  // TODO: 実際のサブスクリプション作成処理を実装
  return `「${args.name}」のサブスクリプションを登録しました。金額: ${args.price}${args.currency}/月`;
};

/**
 * サブスクリプション取得処理
 */
const handleGetSubscriptions = async (db: DrizzleClient): Promise<string> => {
  console.log('サブスクリプション取得');
  // TODO: 実際のサブスクリプション取得処理を実装
  return 'あなたのサブスクリプション一覧です。\n' + '（ここには実際のサブスクリプション情報が表示されます）';
};

/**
 * サブスクリプション詳細取得処理
 */
const handleGetSubscriptionDetail = async (db: DrizzleClient, args: GetSubscriptionDetailFunctionArgs): Promise<string> => {
  console.log('サブスクリプション詳細取得:', args);
  // TODO: 実際のサブスクリプション詳細取得処理を実装
  return 'サブスクリプションの詳細情報です。';
};

/**
 * サブスクリプション更新処理
 */
const handleUpdateSubscription = async (db: DrizzleClient, args: UpdateSubscriptionFunctionArgs): Promise<string> => {
  console.log('サブスクリプション更新:', args);
  // TODO: 実際のサブスクリプション更新処理を実装
  return 'サブスクリプション情報を更新しました。';
};

/**
 * サブスクリプション削除処理
 */
const handleDeleteSubscription = async (db: DrizzleClient, args: DeleteSubscriptionFunctionArgs): Promise<string> => {
  console.log('サブスクリプション削除:', args.id);
  // TODO: 実際のサブスクリプション削除処理を実装
  return 'サブスクリプションを削除しました。';
};
