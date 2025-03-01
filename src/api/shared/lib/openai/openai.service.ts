import type { SubscriptionEntity } from '@/api/shared/domain/subscription';
import OpenAI from 'openai';
import type { OpenAIClientOptions, OpenAIServiceResult, ToolCallResult } from './openai.types';
import { FunctionName, subscriptionFunctions } from './subscription-functions';

/**
 * OpenAI APIクライアントを作成する
 */
const _createOpenAIClient = (options?: OpenAIClientOptions): OpenAI => {
  return new OpenAI({
    apiKey: options?.apiKey || process.env.OPENAI_API_KEY || 'mock-api-key',
  });
};

/**
 * ユーザーメッセージからインテントを解析し、適切なサブスクリプション操作を決定する
 * @param client OpenAIクライアント
 * @returns インテント解析関数
 */
const parseSubscriptionIntent =
  (client: OpenAI) =>
  async (p: { userMessage: string; subscriptions: SubscriptionEntity[] }): Promise<OpenAIServiceResult> => {
    try {
      console.time('OpenAIService.parseSubscriptionIntent client.chat.completions.create');
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `
あなたはサブスクリプション管理システムの専門アシスタントです。ユーザーのメッセージを分析し、サブスクリプションに関する意図を正確に特定して適切な関数を呼び出してください。

## 現在のサブスクリプション情報
${
  p.subscriptions.length > 0
    ? `ユーザーは以下のサブスクリプションを登録しています：
${p.subscriptions.map((sub) => `- ID: ${sub.id}, 名前: ${sub.name}, 料金: ${sub.price}${sub.currency}, サイクル: ${sub.cycle}`).join('\n')}`
    : 'ユーザーのサブスクリプションは登録されていません。'
}

## あなたの役割
- ユーザーの発言からサブスクリプション操作の意図を抽出する
- メッセージに特定のサブスクリプション名が含まれる場合、既存のサブスクリプション一覧から一致するものを特定する
- サブスクリプション名が曖昧な場合でも、部分一致や類似した名前から最適な候補を選択する

## 判断基準
- サブスクリプション名が言及された場合、既存リストから一致するIDを特定する
- ${FunctionName.createSubscription}
  - 特定の名前がある
  - 「登録」「追加」「作成」「申し込み」などの表現
- ${FunctionName.getSubscriptions}
  - 特定の名前なし
  - 「一覧」「確認」「表示」「見せて」「教えて」などの表現
- ${FunctionName.getSubscriptionDetail}
  - 特定の名前がある
  - 「詳細」「詳しく」「教えて」などの表現
  - 操作の表現がない場合
- ${FunctionName.updateSubscription}
  - 特定の名前がある
  - 「変更」「更新」「編集」「修正」などの表現
  - 「キャンセル」「解約」「退会」などの表現がある場合は、subscription.cancelledAtを更新する
- ${FunctionName.deleteSubscription}
  - 特定の名前がある
  - 「削除」などの表現

## 精度向上のポイント
- サブスクリプション名の言及を正確に検出（例: 「Netflix」「ネットフリックス」など表記揺れも考慮）
- 対象が具体的に指定されている場合、既存サブスクリプションから正確にIDを特定
- 「Spotifyの支払いを変更」のように、操作と対象が組み合わさった表現を適切に解析
- サブスクの名前のみ言及され操作が明示されていない場合は、文脈から最も適切な操作を推測

## 例:
- 「Netflix月額1,500円」→ createSubscription（新規作成）
- 「サブスク一覧」→ getSubscriptions
- 「ChatGPT」 → getSubscriptionDetail
- 「Spotify980円」→ updateSubscription（既存Spotifyサブスクを特定してID指定）
- 「Amazonプライムキャンセル」→ deleteSubscription（既存Amazonプライムサブスクを特定してID指定）

## 重要:
- サブスクリプションに関係ないメッセージの場合は必ず null を返す
- 既存のサブスクリプションへの操作は、必ず正確なIDを使用する
- 言及されたサブスク名が既存リストに存在しない場合のみ新規作成と判断する
- 複数の候補がある場合は、名前の一致度や文脈から最も適切なものを選択する
`,
          },
          {
            role: 'user',
            content: p.userMessage,
          },
        ],
        tools: subscriptionFunctions.map((func) => ({
          type: 'function',
          function: func,
        })),
        tool_choice: 'auto',
      });

      console.timeEnd('OpenAIService.parseSubscriptionIntent client.chat.completions.create');
      console.dir({ response }, { depth: null });

      const message = response.choices[0].message;

      // tool_callsの結果をパース
      let functionCall: ToolCallResult = null;
      if (message.tool_calls && message.tool_calls.length > 0) {
        const toolCall = message.tool_calls[0];
        if (toolCall.type === 'function') {
          functionCall = {
            name: toolCall.function.name,
            args: JSON.parse(toolCall.function.arguments),
          };
        }
      }

      return {
        message,
        functionCall,
      };
    } catch (error) {
      console.error('OpenAI API呼び出しエラー:', error);
      throw error;
    }
  };

/**
 * OpenAI サービス
 * OpenAI API を使用するための関数群
 */
export const OpenAIService = {
  new: (options?: OpenAIClientOptions) => {
    const client = _createOpenAIClient(options);

    return {
      parseSubscriptionIntent: parseSubscriptionIntent(client),
    };
  },
};

export type OpenAIService = ReturnType<typeof OpenAIService.new>;
