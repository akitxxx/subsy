import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';

export const subscriptionFunctions = [
  {
    name: 'createSubscription',
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
];
