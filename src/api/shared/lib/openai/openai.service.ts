import OpenAI from 'openai';
import type { FunctionCallResult, OpenAIClientOptions, OpenAIServiceResult } from './openai.types';
import { subscriptionFunctions } from './subscription-functions';

/**
 * OpenAI APIを使用するサービスクラス
 */
export class OpenAiService {
  private client: OpenAI;

  constructor(options?: OpenAIClientOptions) {
    this.client = new OpenAI({
      apiKey: options?.apiKey || process.env.OPENAI_API_KEY || 'mock-api-key',
    });
  }

  /**
   * ユーザーメッセージからインテントを解析し、適切なサブスクリプション操作を決定する
   */
  async parseSubscriptionIntent(userMessage: string): Promise<OpenAIServiceResult> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
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
        functions: subscriptionFunctions,
        function_call: 'auto',
      });

      const message = response.choices[0].message;

      // function_callの結果をパース
      let functionCall: FunctionCallResult = null;
      if (message.function_call) {
        functionCall = {
          name: message.function_call.name,
          args: JSON.parse(message.function_call.arguments),
        };
      }

      return {
        message,
        functionCall,
      };
    } catch (error) {
      console.error('OpenAI API呼び出しエラー:', error);
      throw error;
    }
  }
}
