import { Effect } from 'effect';
import { match } from 'ts-pattern';
import { Subscription, type SubscriptionEntity, type SubscriptionRepository } from '@/api/shared/domain/subscription';
import type {
  DeleteSubscriptionFunctionArgs,
  GetMonthlyTotalFunctionArgs,
  GetSubscriptionDetailFunctionArgs,
  SendMessageFunctionArgs,
  SubscriptionFunctionArgs,
  UpdateSubscriptionFunctionArgs,
} from '@/api/shared/lib/openai';
import { FunctionName } from '@/api/shared/lib/openai/subscription-functions';
import { CurrencyEnum, getCurrentPrefix } from '@/shared/enums/currency.enum';
import { LanguageEnum } from '@/shared/enums/language.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { DateUtils } from '@/shared/utils/date.util';
import { PriceUtils } from '@/shared/utils/price.util';

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

// ============================================================================
// メイン実行関数
// ============================================================================

/**
 * 機能名に応じた処理を実行
 */
export const executeFunctionByName =
  (inject: Inject) =>
  async ({ userId, subscriptions, functionCall }: Input): Promise<Output> => {
    const { name, args } = functionCall;

    try {
      return await match(name)
        .with(FunctionName.createSubscription, () => handleCreateSubscription(inject, userId, args as SubscriptionFunctionArgs))
        .with(FunctionName.getSubscriptions, () => handleGetSubscriptions(subscriptions))
        .with(FunctionName.getSubscriptionDetail, () => handleGetSubscriptionDetail(subscriptions, args as GetSubscriptionDetailFunctionArgs))
        .with(FunctionName.updateSubscription, () => handleUpdateSubscription(inject, subscriptions, args as UpdateSubscriptionFunctionArgs))
        .with(FunctionName.deleteSubscription, () => handleDeleteSubscription(inject, userId, subscriptions, args as DeleteSubscriptionFunctionArgs))
        .with(FunctionName.sendMessage, () => handleSendMessage(inject, args as SendMessageFunctionArgs))
        .with(FunctionName.getMonthlyTotal, () => handleGetMonthlyTotal(subscriptions, args as GetMonthlyTotalFunctionArgs))
        .otherwise(() => {
          throw new Error(`未知の機能: ${name}`);
        });
    } catch (error) {
      console.error(`関数実行エラー: ${name}`, error);
      return { message: `処理中にエラーが発生しました: ${(error as Error).message}` };
    }
  };

// ============================================================================
// 機能ハンドラー関数
// ============================================================================

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
    startedAt: args.startedAt ? DateUtils.create.fromISOString(args.startedAt) : DateUtils.create.now(),
    cancelledAt: args.cancelledAt ? DateUtils.create.fromISOString(args.cancelledAt) : null,
    description: args.description ?? null,
  });

  await Effect.runPromise(inject.subscriptionRepository.create({ entity: newSubscription }));

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
    message: `登録済みサブスクリプション（${subscriptions.length}件）

${subscriptions
  .map(
    (subscription) => `・${subscription.name}
　・${formatPrice(subscription.price, subscription.currency)}/${getCycleMonths(subscription.cycle)}`,
  )
  .join('\n')}

サブスクリプション名を指定すると詳細を確認できます。`,
  };
};

/**
 * サブスクリプション詳細取得処理
 */
const handleGetSubscriptionDetail = async (subscriptions: SubscriptionEntity[], args: GetSubscriptionDetailFunctionArgs): Promise<Output> => {
  console.dir({ 'サブスクリプション詳細取得:': { args } }, { depth: null });

  const subscription = subscriptions.find((s) => s.id === args.id);
  if (!subscription) return { message: 'サブスクリプションが見つかりません' };

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

  const subscription = subscriptions.find((s) => s.id === args.id);
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

  await Effect.runPromise(inject.subscriptionRepository.update({ entity: updatedSubscription }));

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

  const subscription = subscriptions.find((s) => s.id === args.id);
  if (!subscription) return { message: 'サブスクリプションが見つかりません' };

  await Effect.runPromise(inject.subscriptionRepository.delete({ id: args.id, userId }));

  return {
    message: `サブスクリプションを削除しました。\n\n${formatSubscriptionDetails(subscription)}`,
  };
};

/**
 * メッセージ送信処理
 */
const handleSendMessage = async (_inject: Inject, args: SendMessageFunctionArgs): Promise<Output> => {
  console.dir({ 'メッセージ送信:': { args } }, { depth: null });
  return { message: args.message };
};

/**
 * 月間支払い合計取得処理
 */
const handleGetMonthlyTotal = async (subscriptions: SubscriptionEntity[], args: GetMonthlyTotalFunctionArgs): Promise<Output> => {
  console.dir({ '月間支払い合計取得:': { args } }, { depth: null });

  // 基本情報の取得
  const now = DateUtils.create.now();
  const targetDate = args.targetDate ? DateUtils.create.fromISOString(args.targetDate) : now;
  const isJapanese = args.language === LanguageEnum.Japanese;

  // 対象月のサブスクリプション支払いを計算
  const { totalJpy, totalUsd, subscriptionCount } = calculateMonthlyPayments(subscriptions, targetDate, now);

  // 表示用の年月文字列を生成
  const yearMonthStr = (() => {
    const isCurrentMonth = DateUtils.compare.isSameMonth(targetDate, now);
    if (isJapanese) return isCurrentMonth ? '今月' : `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月`;
    return isCurrentMonth ? 'this month' : `${targetDate.getMonth() + 1}/${targetDate.getFullYear()}`;
  })();

  // 言語に応じたメッセージを作成して返す
  // 日本語の場合はドルを円に変換
  const grandTotal = isJapanese ? totalJpy + PriceUtils.conversion.usdToJpy(totalUsd) : PriceUtils.conversion.jpyToUsd(totalJpy) + totalUsd;

  return {
    message: isJapanese
      ? `${yearMonthStr}の支払い予定合計: ¥${Math.floor(grandTotal).toLocaleString()}（${subscriptionCount}件）`
      : `Total payments due for ${yearMonthStr}: $${Math.floor(grandTotal).toLocaleString()}（${subscriptionCount} subscriptions）`,
  };
};

// ============================================================================
// 支払い計算関連関数
// ============================================================================

/**
 * 対象月のサブスクリプション支払いを計算する
 */
const calculateMonthlyPayments = (
  subscriptions: SubscriptionEntity[],
  targetDate: Date,
  now: Date,
): { totalJpy: number; totalUsd: number; subscriptionCount: number } => {
  // データ処理パイプライン
  const payments = subscriptions
    // 有効なサブスクリプションのみをフィルタリング
    .filter((subscription) => !(subscription.expiredAt && DateUtils.compare.isBefore(subscription.expiredAt, now)))
    // 各サブスクリプションの支払い情報を計算
    .map((subscription) => calculateSubscriptionPayment(subscription, targetDate));

  // 支払い情報を集計
  return aggregatePayments(payments);
};

/**
 * サブスクリプションの対象月の支払い情報を計算する
 */
const calculateSubscriptionPayment = (subscription: SubscriptionEntity, targetDate: Date): PaymentInfo | null => {
  const paymentDates = Subscription.getPaymentDatesInMonth(subscription)(targetDate);

  if (paymentDates.length === 0) {
    return null;
  }

  return {
    amount: Number(subscription.price) * paymentDates.length,
    currency: subscription.currency,
    count: 1,
  };
};

/**
 * 支払い情報を集計する
 */
type AggregatedPayments = {
  totalJpy: number;
  totalUsd: number;
  subscriptionCount: number;
};

type PaymentInfo = {
  amount: number;
  currency: CurrencyEnum;
  count: number;
};

const aggregatePayments = (payments: (PaymentInfo | null)[]): AggregatedPayments => {
  const validPayments = payments.filter((payment): payment is PaymentInfo => payment !== null);

  return validPayments.reduce(
    (acc, payment) => {
      match(payment.currency)
        .with(CurrencyEnum.Jpy, () => {
          acc.totalJpy += payment.amount;
        })
        .with(CurrencyEnum.Usd, () => {
          acc.totalUsd += payment.amount;
        })
        .exhaustive();

      acc.subscriptionCount += payment.count;
      return acc;
    },
    { totalJpy: 0, totalUsd: 0, subscriptionCount: 0 },
  );
};

// ============================================================================
// フォーマット関連関数
// ============================================================================

/**
 * サブスクリプション詳細を整形する
 */
const formatSubscriptionDetails = (subscription: SubscriptionEntity): string => {
  const now = DateUtils.create.now();
  const nextPayment = subscription.cancelledAt ? '' : `次の支払い: ${formatDate(Subscription.getNextPaymentAt(subscription)(now))}\n`;
  const cancelInfo = subscription.cancelledAt ? `キャンセル: ${formatDate(subscription.cancelledAt)}\n` : '';
  const expireInfo = subscription.expiredAt ? `期限切れ: ${formatDate(subscription.expiredAt)}\n` : '';

  const status = Subscription.getStatus(subscription)(now);
  const statusStr = Subscription.getStatusLabel(status);

  return `名前: ${subscription.name}
ステータス: ${statusStr}
金額: ${formatPrice(subscription.price, subscription.currency)}/${getCycleMonths(subscription.cycle)}
開始: ${formatDate(subscription.startedAt)}
${nextPayment}${cancelInfo}${expireInfo}`.trim();
};

/**
 * 日付をフォーマットする補助関数
 */
const formatDate = (date: Date): string => {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

/**
 * 価格をフォーマットする補助関数
 */
const formatPrice = (price: string, currency: CurrencyEnum): string =>
  match(currency)
    .with(CurrencyEnum.Jpy, () => `${getCurrentPrefix(currency)}${Math.floor(Number(price)).toLocaleString()}`)
    .with(CurrencyEnum.Usd, () => `${getCurrentPrefix(currency)}${price.toLocaleString()}`)
    .exhaustive();

/**
 * サイクル文字列から表示用の期間文字列を取得する補助関数
 */
const getCycleMonths = (cycle: SubscriptionCycleEnum): string =>
  match(cycle)
    .with(SubscriptionCycleEnum.OneMonth, () => '月')
    .with(SubscriptionCycleEnum.ThreeMonths, () => '3ヶ月')
    .with(SubscriptionCycleEnum.SixMonths, () => '6ヶ月')
    .with(SubscriptionCycleEnum.OneYear, () => '年')
    .exhaustive();
