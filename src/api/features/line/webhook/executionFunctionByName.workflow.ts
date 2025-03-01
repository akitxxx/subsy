import { Subscription, type SubscriptionEntity, type SubscriptionRepository } from '@/api/shared/domain/subscription';
import type {
  DeleteSubscriptionFunctionArgs,
  GetSubscriptionDetailFunctionArgs,
  SubscriptionFunctionArgs,
  UpdateSubscriptionFunctionArgs,
} from '@/api/shared/lib/openai';
import { FunctionName } from '@/api/shared/lib/openai/subscription-functions';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { DateUtils } from '@/shared/utils/date.util';

type Inject = {
  subscriptionRepository: SubscriptionRepository;
};

type Input = {
  userId: string;
  subscriptions: SubscriptionEntity[];
  functionCall: { name: string; args: unknown };
};

type Output = {
  message: string;
};

/**
 * 機能名に応じた処理を実行
 */
export const executeFunctionByName =
  (inject: Inject) =>
  async ({ userId, subscriptions, functionCall }: Input): Promise<Output> => {
    const { name, args } = functionCall;

    try {
      switch (name) {
        case FunctionName.createSubscription:
          return handleCreateSubscription(inject, userId, args as SubscriptionFunctionArgs);
        case FunctionName.getSubscriptions:
          return handleGetSubscriptions(subscriptions);
        case FunctionName.getSubscriptionDetail:
          return handleGetSubscriptionDetail(subscriptions, args as GetSubscriptionDetailFunctionArgs);
        case FunctionName.updateSubscription:
          return handleUpdateSubscription(inject, subscriptions, args as UpdateSubscriptionFunctionArgs);
        case FunctionName.deleteSubscription:
          return handleDeleteSubscription(inject, userId, subscriptions, args as DeleteSubscriptionFunctionArgs);
        default:
          throw new Error(`未知の機能: ${name}`);
      }
    } catch (error) {
      console.error(`関数実行エラー: ${name}`, error);
      return { message: `処理中にエラーが発生しました: ${(error as Error).message}` };
    }
  };

/**
 * サブスクリプション作成処理
 */
const handleCreateSubscription = async (inject: Inject, userId: string, args: SubscriptionFunctionArgs): Promise<Output> => {
  console.dir({ 'サブスクリプション作成:': { args } }, { depth: null });

  const newSubscription = Subscription.create({
    userId,
    name: args.name,
    price: args.price,
    currency: args.currency,
    cycle: args.cycle,
    startedAt: DateUtils.create.fromISOString(args.startedAt),
    cancelledAt: args.cancelledAt ? DateUtils.create.fromISOString(args.cancelledAt) : null,
    description: args.description ?? null,
  });

  await inject.subscriptionRepository.create({ entity: newSubscription });

  return {
    message: `サブスクリプションを登録しました。\n\n${formatSubscriptionDetails(newSubscription)}`,
  };
};

/**
 * サブスクリプション一覧取得処理
 */
const handleGetSubscriptions = async (subscriptions: SubscriptionEntity[]): Promise<Output> => {
  console.dir({ 'サブスクリプション一覧取得:': { subscriptions } }, { depth: null });

  if (subscriptions.length === 0) {
    return { message: 'サブスクリプションの登録がありません。' };
  }

  return {
    message: `登録済みサブスクリプション（${subscriptions.length}件）：

${subscriptions.map((subscription, index) => `・${subscription.name}`).join('\n')}

サブスクリプション名を指定すると詳細を確認できます。`,
  };
};

/**
 * サブスクリプション詳細取得処理
 */
const handleGetSubscriptionDetail = async (subscriptions: SubscriptionEntity[], args: GetSubscriptionDetailFunctionArgs): Promise<Output> => {
  console.dir({ 'サブスクリプション詳細取得:': { args } }, { depth: null });

  const subscription = findSubscriptionById(subscriptions, args.id);
  if (!subscription) {
    return { message: 'サブスクリプションが見つかりません' };
  }

  return {
    message: `サブスクリプション情報：\n\n${formatSubscriptionDetails(subscription)}`,
  };
};

/**
 * サブスクリプション更新処理
 */
const handleUpdateSubscription = async (
  inject: Inject,
  subscriptions: SubscriptionEntity[],
  args: UpdateSubscriptionFunctionArgs,
): Promise<Output> => {
  console.dir({ 'サブスクリプション更新:': { subscriptions, args } }, { depth: null });

  const subscription = findSubscriptionById(subscriptions, args.id);
  if (!subscription) {
    return { message: 'サブスクリプションが見つかりません' };
  }

  const updatedSubscription = Subscription.update(subscription)({
    name: args.name ?? subscription.name,
    price: args.price ?? subscription.price,
    currency: args.currency ?? subscription.currency,
    cycle: args.cycle ?? subscription.cycle,
    startedAt: args.startedAt ? DateUtils.create.fromISOString(args.startedAt) : subscription.startedAt,
    cancelledAt: args.cancelledAt ? DateUtils.create.fromISOString(args.cancelledAt) : subscription.cancelledAt,
    description: args.description ?? subscription.description,
  });

  await inject.subscriptionRepository.update({ entity: updatedSubscription });

  return {
    message: `サブスクリプションを更新しました。\n\n${formatSubscriptionDetails(updatedSubscription)}`,
  };
};

/**
 * サブスクリプション削除処理
 */
const handleDeleteSubscription = async (
  inject: Inject,
  userId: string,
  subscriptions: SubscriptionEntity[],
  args: DeleteSubscriptionFunctionArgs,
): Promise<Output> => {
  console.dir({ 'サブスクリプション削除:': { userId, args } }, { depth: null });

  const subscription = findSubscriptionById(subscriptions, args.id);
  if (!subscription) {
    return { message: 'サブスクリプションが見つかりません' };
  }

  await inject.subscriptionRepository.delete({ id: args.id, userId });

  return {
    message: `サブスクリプションを削除しました。\n\n${formatSubscriptionDetails(subscription)}`,
  };
};

/**
 * サブスクリプション詳細を整形する
 */
const formatSubscriptionDetails = (subscription: SubscriptionEntity): string => {
  const now = DateUtils.create.now();
  const nextPayment = subscription.cancelledAt ? '' : `次の支払: ${formatDate(Subscription.getNextPaymentAt(subscription)(now))}\n`;
  const cancelInfo = subscription.cancelledAt ? `キャンセル: ${formatDate(subscription.cancelledAt)}\n` : '';
  const expireInfo = subscription.expiredAt ? `期限切れ: ${formatDate(subscription.expiredAt)}\n` : '';

  return `名前: ${subscription.name}
金額: ${subscription.price}${subscription.currency}/${getCycleMonths(subscription.cycle)}
開始: ${formatDate(subscription.startedAt)}
${nextPayment}${cancelInfo}${expireInfo}`.trim();
};

/**
 * IDでサブスクリプションを検索
 */
const findSubscriptionById = (subscriptions: SubscriptionEntity[], id: string): SubscriptionEntity | undefined => {
  return subscriptions.find((s) => s.id === id);
};

/**
 * 日付をフォーマットする補助関数
 */
const formatDate = (date: Date): string => {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

/**
 * サイクル文字列から表示用の期間文字列を取得する補助関数
 */
const getCycleMonths = (cycle: SubscriptionCycleEnum): string => {
  switch (cycle) {
    case SubscriptionCycleEnum.OneMonth:
      return '月';
    case SubscriptionCycleEnum.ThreeMonths:
      return '3ヶ月';
    case SubscriptionCycleEnum.SixMonths:
      return '6ヶ月';
    case SubscriptionCycleEnum.OneYear:
      return '年';
    default:
      return '月';
  }
};
