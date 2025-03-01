import type { ChatCompletionMessage } from 'openai/resources';

export interface OpenAIClientOptions {
  apiKey?: string;
  model?: string;
}

export interface SubscriptionFunctionArgs {
  name: string;
  price: string;
  currency: 'JPY' | 'USD';
  cycle: 'ONE_WEEK' | 'TWO_WEEKS' | 'ONE_MONTH' | 'THREE_MONTHS' | 'SIX_MONTHS' | 'ONE_YEAR';
  startedAt: string;
  description?: string;
}

export interface UpdateSubscriptionFunctionArgs extends Partial<SubscriptionFunctionArgs> {
  id: string;
}

export interface DeleteSubscriptionFunctionArgs {
  id: string;
}

export type ToolCallResult = {
  name: string;
  args: SubscriptionFunctionArgs | UpdateSubscriptionFunctionArgs | DeleteSubscriptionFunctionArgs | Record<string, never>;
} | null;

export type FunctionCallResult = ToolCallResult;

export interface OpenAIServiceResult {
  message: ChatCompletionMessage;
  functionCall: ToolCallResult;
}
