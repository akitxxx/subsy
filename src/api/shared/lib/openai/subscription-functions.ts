import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { LanguageEnum } from '@/shared/enums/language.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';

export const FunctionName = {
  createSubscription: 'createSubscription',
  getSubscriptions: 'getSubscriptions',
  getSubscriptionDetail: 'getSubscriptionDetail',
  updateSubscription: 'updateSubscription',
  deleteSubscription: 'deleteSubscription',
  sendMessage: 'sendMessage', // ユーザーにメッセージを送信する
  getMonthlyTotal: 'getMonthlyTotal', // 月間の支払い合計を取得する
} as const;
export type FunctionName = (typeof FunctionName)[keyof typeof FunctionName];

export const subscriptionFunctions = [
  {
    name: FunctionName.createSubscription,
    description: '新しいサブスクリプションを作成する',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'サブスクリプションの名前',
        },
        price: {
          type: 'string',
          description: '価格',
        },
        currency: {
          type: 'string',
          enum: Object.values(CurrencyEnum),
          description: '通貨単位',
        },
        cycle: {
          type: 'string',
          enum: Object.values(SubscriptionCycleEnum),
          description: '支払いサイクル',
        },
        startedAt: {
          type: 'string',
          description: '開始日（ISO形式）',
        },
        cancelledAt: {
          type: 'string',
          description: 'キャンセル日（ISO形式）',
        },
        description: {
          type: 'string',
          description: '説明（オプショナル）',
        },
      },
      required: ['name', 'price', 'currency', 'cycle', 'startedAt'],
    },
  },
  {
    name: 'getSubscriptions',
    description: 'ユーザーのサブスクリプション一覧を取得する',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: FunctionName.getSubscriptionDetail,
    description: '特定のサブスクリプションの詳細情報を取得する',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'サブスクリプションID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'updateSubscription',
    description: '既存のサブスクリプションを更新する',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'サブスクリプションID',
        },
        name: {
          type: 'string',
          description: 'サブスクリプションの名前',
        },
        price: {
          type: 'string',
          description: '価格',
        },
        currency: {
          type: 'string',
          enum: Object.values(CurrencyEnum),
          description: '通貨単位',
        },
        cycle: {
          type: 'string',
          enum: Object.values(SubscriptionCycleEnum),
          description: '支払いサイクル',
        },
        startedAt: {
          type: 'string',
          description: '開始日（ISO形式）',
        },
        cancelledAt: {
          type: 'string',
          description: 'キャンセル日（ISO形式）',
        },
        description: {
          type: 'string',
          description: '説明',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'deleteSubscription',
    description: 'サブスクリプションを削除する',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'サブスクリプションID',
        },
      },
      required: ['id'],
    },
  },
  {
    name: FunctionName.sendMessage,
    description: '操作に必要な情報が足りない場合、ユーザーにメッセージを送信する',
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'メッセージ',
        },
      },
      required: ['message'],
    },
  },
  {
    name: FunctionName.getMonthlyTotal,
    description: '指定された月（デフォルトは今月）の支払い予定の合計金額を取得する',
    parameters: {
      type: 'object',
      properties: {
        language: {
          type: 'string',
          enum: Object.values(LanguageEnum),
          description: 'ユーザーの言語（日本語または英語）',
        },
        year: {
          type: 'number',
          description: '年（指定がない場合は現在の年）',
        },
        month: {
          type: 'number',
          description: '月（1-12、指定がない場合は現在の月）',
        },
      },
      required: ['language', 'year', 'month'],
    },
  },
];
