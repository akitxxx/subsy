import type { SubscriptionEntity } from '@/api/shared/domain/subscription';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { DateUtils } from '@/shared/utils/date.util';
import OpenAI from 'openai';
import type { OpenAIClientOptions, OpenAIServiceResult, ToolCallResult } from './openai.types';
import { getPrompt } from './prompt';
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
    const now = DateUtils.create.now();

    try {
      console.time('OpenAIService.parseSubscriptionIntent client.chat.completions.create');
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: getPrompt({ now, subscriptions: p.subscriptions }),
          },
          {
            role: 'user',
            content: p.userMessage,
          },
        ],
        tools: subscriptionFunctions.map((func) => ({ type: 'function', function: func })),
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

      return { message, functionCall };
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
