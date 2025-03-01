import OpenAI from 'openai';
import type { OpenAIClientOptions, OpenAIServiceResult, ToolCallResult } from './openai.types';
import { subscriptionFunctions } from './subscription-functions';

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
  async (userMessage: string): Promise<OpenAIServiceResult> => {
    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'あなたはサブスクリプション管理アシスタントです。ユーザーのメッセージからサブスクリプションに関する操作を抽出し、適切な関数を呼び出してください。',
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        tools: subscriptionFunctions.map((func) => ({
          type: 'function',
          function: func,
        })),
        tool_choice: 'auto',
      });

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
