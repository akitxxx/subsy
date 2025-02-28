import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { DateUtils } from '@/shared/utils/date.util';
import { beforeEach, describe, expect, it } from 'vitest';
import { vi } from 'vitest';
import type { SubscriptionEntity } from './subscription.entity';
import { Subscription } from './subscription.logic';

// ===== グローバル変数とテストフック =====

// モック用の現在時刻
let now: Date = new Date('2025-01-01 00:00:00');

// 各テスト前にDateUtils.nowをモック
beforeEach(() => {
  vi.spyOn(DateUtils.create, 'now').mockImplementation(() => now);
});

// ===== 共通ヘルパー関数 =====

/**
 * テスト用のサブスクリプションエンティティを作成する
 */
const createSubscription = (params: Partial<SubscriptionEntity> & Pick<SubscriptionEntity, 'cycle' | 'startedAt'>): SubscriptionEntity => {
  const currentNow = DateUtils.create.now();
  return {
    id: 'test-id',
    name: 'Test Subscription',
    price: '1000',
    currency: CurrencyEnum.Jpy,
    userId: 'test-user-id',
    cancelledAt: null,
    expiredAt: null,
    description: null,
    createdAt: currentNow,
    updatedAt: currentNow,
    deletedAt: null,
    ...params,
  };
};

describe('Subscription', () => {
  // ===== getNextPaymentAt のテスト =====
  describe('getNextPaymentAt', () => {
    // 各サイクルと日付パターンのテストケース
    type NextPaymentTestCase = {
      name: string;
      startedAt: Date;
      mockNow: Date;
      expected: Date;
    };

    // サイクルごとのテストケース
    type CycleTestGroup = {
      cycle: SubscriptionCycleEnum;
      cases: NextPaymentTestCase[];
    };

    // すべてのサイクルのテストケース
    const cycleTestGroups: CycleTestGroup[] = [
      {
        cycle: SubscriptionCycleEnum.OneMonth,
        cases: [
          {
            name: '開始日1/1から現在1/1の場合、次回は2/1',
            startedAt: new Date('2025-01-01 00:00:00'),
            mockNow: new Date('2025-01-01 00:00:00'),
            expected: new Date('2025-02-01 00:00:00'),
          },
          {
            name: '開始日1/1から現在2/15の場合、次回は3/1',
            startedAt: new Date('2025-01-01 00:00:00'),
            mockNow: new Date('2025-02-15 00:00:00'),
            expected: new Date('2025-03-01 00:00:00'),
          },
          {
            name: '開始日1/1から現在3/15の場合、次回は4/1',
            startedAt: new Date('2025-01-01 00:00:00'),
            mockNow: new Date('2025-03-15 00:00:00'),
            expected: new Date('2025-04-01 00:00:00'),
          },
          {
            name: '開始日1/31から現在2/15の場合、次回は2/28',
            startedAt: new Date('2025-01-31 00:00:00'),
            mockNow: new Date('2025-02-15 00:00:00'),
            expected: new Date('2025-02-28 00:00:00'),
          },
        ],
      },
      {
        cycle: SubscriptionCycleEnum.ThreeMonths,
        cases: [
          {
            name: '開始日1/1から現在1/1の場合、次回は4/1',
            startedAt: new Date('2025-01-01 00:00:00'),
            mockNow: new Date('2025-01-01 00:00:00'),
            expected: new Date('2025-04-01 00:00:00'),
          },
          {
            name: '開始日1/1から現在3/15の場合、次回は4/1',
            startedAt: new Date('2025-01-01 00:00:00'),
            mockNow: new Date('2025-03-15 00:00:00'),
            expected: new Date('2025-04-01 00:00:00'),
          },
          {
            name: '開始日1/1から現在5/15の場合、次回は7/1',
            startedAt: new Date('2025-01-01 00:00:00'),
            mockNow: new Date('2025-05-15 00:00:00'),
            expected: new Date('2025-07-01 00:00:00'),
          },
        ],
      },
      {
        cycle: SubscriptionCycleEnum.SixMonths,
        cases: [
          {
            name: '開始日1/1から現在1/1の場合、次回は7/1',
            startedAt: new Date('2025-01-01 00:00:00'),
            mockNow: new Date('2025-01-01 00:00:00'),
            expected: new Date('2025-07-01 00:00:00'),
          },
          {
            name: '開始日1/1から現在4/15の場合、次回は7/1',
            startedAt: new Date('2025-01-01 00:00:00'),
            mockNow: new Date('2025-04-15 00:00:00'),
            expected: new Date('2025-07-01 00:00:00'),
          },
          {
            name: '開始日1/1から現在8/15の場合、次回は1/1',
            startedAt: new Date('2025-01-01 00:00:00'),
            mockNow: new Date('2025-08-15 00:00:00'),
            expected: new Date('2026-01-01 00:00:00'),
          },
        ],
      },
      {
        cycle: SubscriptionCycleEnum.OneYear,
        cases: [
          {
            name: '開始日1/1から現在1/1の場合、次回は1/1',
            startedAt: new Date('2025-01-01 00:00:00'),
            mockNow: new Date('2025-01-01 00:00:00'),
            expected: new Date('2026-01-01 00:00:00'),
          },
          {
            name: '開始日1/1から現在7/15の場合、次回は1/1',
            startedAt: new Date('2025-01-01 00:00:00'),
            mockNow: new Date('2025-07-15 00:00:00'),
            expected: new Date('2026-01-01 00:00:00'),
          },
          {
            name: '開始日1/1から現在2/15(翌年)の場合、次回は1/1(翌々年)',
            startedAt: new Date('2025-01-01 00:00:00'),
            mockNow: new Date('2026-02-15 00:00:00'),
            expected: new Date('2027-01-01 00:00:00'),
          },
        ],
      },
    ];

    // サイクルごとのテストケースを実行
    describe.each(cycleTestGroups)('$cycle', ({ cycle, cases }) => {
      it.each(cases)(`${cycle} $name`, ({ startedAt, mockNow, expected }) => {
        // テスト内でモック用の現在時刻を設定
        now = mockNow;

        const subscription = createSubscription({ cycle, startedAt });
        const result = Subscription.getNextPaymentAt(subscription)(mockNow);
        expect(result).toEqual(expected);
      });
    });

    it('無効なサイクルの場合、エラーをスローすること', () => {
      expect(() => {
        const subscription = createSubscription({
          cycle: 'InvalidCycle' as SubscriptionCycleEnum,
          startedAt: new Date('2025-01-01 00:00:00'),
        });
        Subscription.getNextPaymentAt(subscription)(new Date('2025-01-01 00:00:00'));
      }).toThrow('Invalid subscription cycle: InvalidCycle');
    });
  });

  // ===== update メソッドのテスト =====
  describe('update', () => {
    // 共通のテストケース定義型
    type UpdateTestCase = {
      name: string;
      initial: Partial<SubscriptionEntity> & Pick<SubscriptionEntity, 'cycle' | 'startedAt'>;
      update: Partial<SubscriptionEntity>;
      expected: Partial<SubscriptionEntity>;
      expectedExpiredAt?: Date;
      mockNow?: Date;
      additionalAssertions?: (updated: SubscriptionEntity) => void;
    };

    // テスト検証用のヘルパー関数
    const verifyUpdatedSubscription = (testCase: UpdateTestCase): SubscriptionEntity => {
      const { initial, update, expected, expectedExpiredAt, mockNow, additionalAssertions } = testCase;

      // モック用の現在時刻を設定（指定があれば）
      if (mockNow) {
        now = mockNow;
      }

      const subscription = createSubscription(initial);
      const updated = Subscription.update(subscription)(update);

      // 更新されたフィールドの検証
      for (const [key, value] of Object.entries(expected)) {
        expect(updated[key as keyof SubscriptionEntity]).toEqual(value);
      }

      // 期限日の検証（もし期待値があれば）
      if (expectedExpiredAt) {
        expect(updated.expiredAt).toEqual(expectedExpiredAt);
      }

      // 更新されていないフィールドの検証
      for (const [key, value] of Object.entries(subscription)) {
        if (!(key in expected) && !(key in update) && key !== 'updatedAt' && key !== 'expiredAt') {
          expect(updated[key as keyof SubscriptionEntity]).toEqual(value);
        }
      }

      // 追加の検証があれば実行
      if (additionalAssertions) {
        additionalAssertions(updated);
      }

      return updated;
    };

    // 基本的な初期ステート
    const baseInitialState = {
      cycle: SubscriptionCycleEnum.OneMonth,
      startedAt: new Date('2025-01-01 00:00:00'),
      cancelledAt: null,
    };

    // すべてのテストケースのコレクション
    const allTestCases: Record<string, UpdateTestCase[]> = {
      // キャンセル済みのテストケース
      cancelled: [
        {
          name: 'キャンセル解除する場合',
          initial: {
            ...baseInitialState,
            cancelledAt: new Date('2025-01-15 00:00:00'),
          },
          update: { cancelledAt: null },
          expected: {
            cancelledAt: null,
            expiredAt: null,
          },
        },
        {
          name: 'キャンセル日を変更する場合',
          initial: {
            ...baseInitialState,
            cancelledAt: new Date('2025-01-15 00:00:00'),
          },
          update: { cancelledAt: new Date('2025-01-20 00:00:00') },
          expected: {
            cancelledAt: new Date('2025-01-20 00:00:00'),
          },
          expectedExpiredAt: new Date('2026-02-28T14:59:59.999Z'),
        },
      ],

      // 通常更新のテストケース
      regular: [
        {
          name: 'キャンセルしていない場合',
          initial: baseInitialState,
          update: { name: '更新後サブスクリプション', price: '2000' },
          expected: {
            name: '更新後サブスクリプション',
            price: '2000',
            expiredAt: null,
          },
        },
        {
          name: 'サイクルを変更する場合',
          initial: baseInitialState,
          update: { cycle: SubscriptionCycleEnum.ThreeMonths },
          expected: {
            cycle: SubscriptionCycleEnum.ThreeMonths,
            expiredAt: null,
          },
        },
        {
          name: '開始日を変更する場合',
          initial: baseInitialState,
          update: { startedAt: new Date('2025-02-01 00:00:00') },
          expected: {
            startedAt: new Date('2025-02-01 00:00:00'),
            expiredAt: null,
          },
        },
        {
          name: '新規でキャンセルする場合',
          initial: baseInitialState,
          mockNow: new Date('2025-01-15 00:00:00'),
          update: { cancelledAt: new Date('2025-01-15 00:00:00') },
          expected: {
            cancelledAt: new Date('2025-01-15 00:00:00'),
          },
          expectedExpiredAt: new Date('2025-01-31T14:59:59.999Z'),
        },
      ],

      // 複合的な更新のテストケース
      complex: [
        {
          name: 'サイクルとキャンセル状態の同時変更',
          initial: baseInitialState,
          mockNow: new Date('2025-01-15 00:00:00'),
          update: {
            cycle: SubscriptionCycleEnum.ThreeMonths,
            cancelledAt: new Date('2025-01-15 00:00:00'),
          },
          expected: {
            cycle: SubscriptionCycleEnum.ThreeMonths,
            cancelledAt: new Date('2025-01-15 00:00:00'),
          },
          additionalAssertions: (updated) => {
            // 日付型の検証
            expect(updated.expiredAt).toBeInstanceOf(Date);
          },
        },
        {
          name: '全属性の一括更新',
          initial: baseInitialState,
          mockNow: new Date('2025-01-15 00:00:00'),
          update: {
            name: '新しいサブスクリプション',
            price: '5000',
            description: '更新後の説明',
            cycle: SubscriptionCycleEnum.OneYear,
            startedAt: new Date('2025-02-01 00:00:00'),
            cancelledAt: new Date('2025-01-15 00:00:00'),
          },
          expected: {
            name: '新しいサブスクリプション',
            price: '5000',
            description: '更新後の説明',
            cycle: SubscriptionCycleEnum.OneYear,
            startedAt: new Date('2025-02-01 00:00:00'),
            cancelledAt: new Date('2025-01-15 00:00:00'),
          },
          additionalAssertions: (updated) => {
            // 変更されないフィールドの追加検証
            expect(updated.id).toEqual('test-id');
            expect(updated.userId).toEqual('test-user-id');
            expect(updated.currency).toEqual(CurrencyEnum.Jpy);

            // 有効期限の計算が正しいことを確認
            expect(updated.expiredAt).toBeInstanceOf(Date);
            // 年と月だけ確認
            if (updated.expiredAt) {
              expect(updated.expiredAt.getFullYear()).toBe(2025);
              expect(updated.expiredAt.getMonth()).toBe(0); // 0-indexed, 1月は0
            }
          },
        },
      ],
    };

    // キャンセル済みのテストケース実行
    describe('キャンセル済みの場合', () => {
      describe.each(allTestCases.cancelled)('$name', (testCase) => {
        it('正しく更新されること', () => {
          verifyUpdatedSubscription(testCase);
        });
      });
    });

    // 通常更新のテストケース実行
    describe('通常更新の場合', () => {
      describe.each(allTestCases.regular)('$name', (testCase) => {
        it('正しく更新されること', () => {
          verifyUpdatedSubscription(testCase);
        });
      });
    });

    // 複合的な更新のテストケース実行
    describe('複合的な更新の場合', () => {
      describe.each(allTestCases.complex)('$name', (testCase) => {
        it('正しく更新されること', () => {
          verifyUpdatedSubscription(testCase);
        });
      });
    });
  });
});
