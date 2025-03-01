import type { CurrencyEnum } from '@/shared/enums/currency.enum';
import type { LanguageEnum } from '@/shared/enums/language.enum';
import type { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import type { ChatCompletionMessage } from 'openai/resources';

export interface OpenAIClientOptions {
  apiKey?: string;
  model?: string;
}

export interface SubscriptionFunctionArgs {
  name: string;
  price: string;
  currency: CurrencyEnum;
  cycle: SubscriptionCycleEnum;
  startedAt: string;
  cancelledAt?: string;
  description?: string;
}

export interface GetSubscriptionDetailFunctionArgs {
  id: string;
}

export interface UpdateSubscriptionFunctionArgs extends Partial<SubscriptionFunctionArgs> {
  id: string;
}

export interface DeleteSubscriptionFunctionArgs {
  id: string;
}

export interface SendMessageFunctionArgs {
  message: string;
}

export interface GetMonthlyTotalFunctionArgs {
  language?: LanguageEnum;
  year?: number;
  month?: number;
}

export type ToolCallResult = {
  name: string;
  args: SubscriptionFunctionArgs | UpdateSubscriptionFunctionArgs | DeleteSubscriptionFunctionArgs | GetMonthlyTotalFunctionArgs | Record<string, never>;
} | null;

export type FunctionCallResult = ToolCallResult;

export interface OpenAIServiceResult {
  message: ChatCompletionMessage;
  functionCall: ToolCallResult;
}
