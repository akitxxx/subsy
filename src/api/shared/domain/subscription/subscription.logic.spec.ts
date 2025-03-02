import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { DateUtils } from '@/shared/utils/date.util';
import { beforeEach, describe, expect, it } from 'vitest';
import { vi } from 'vitest';
import type { SubscriptionEntity } from './subscription.entity';
import { Subscription } from './subscription.logic';

// ===== グローバル設定 =====

// モック用の基準日時
const MOCK_NOW: Date = new Date('2025-01-01T00:00:00.000Z');

// 共通のモック設定を実行
beforeEach(() => {
  vi.spyOn(DateUtils.create, 'now').mockImplementation(() => MOCK_NOW);
});

// ===== テスト用ヘルパー関数 =====

/**
 * テスト用のサブスクリプションエンティティを作成
 */
const createSubscription = (params: Partial<SubscriptionEntity> & Pick<SubscriptionEntity, 'cycle' | 'startedAt'>): SubscriptionEntity => {
  return {
    id: 'test-id',
    name: 'テストサブスクリプション',
    price: '1000',
    currency: CurrencyEnum.Jpy,
    userId: 'test-user-id',
    cancelledAt: null,
    expiredAt: null,
    description: null,
    createdAt: MOCK_NOW,
    updatedAt: MOCK_NOW,
    deletedAt: null,
    ...params,
  };
};

// ===== テスト本体 =====
describe('Subscription', () => {
  describe('getNextPaymentAt', () => {
    // サイクルごとのテストケース定義
    interface NextPaymentTestCase {
      name: string; // テスト名
      startedAt: Date; // 開始日
      mockNow: Date; // 現在日時
      expected: Date; // 期待される次回支払日
    }

    // サイクルごとのテストグループ
    interface CycleTestGroup {
      cycle: SubscriptionCycleEnum; // サイクル種別
      cases: NextPaymentTestCase[]; // テストケース群
    }

    // テストケースの定義
    const cycleTestGroups: CycleTestGroup[] = [
      // 月次サイクルのテスト
      {
        cycle: SubscriptionCycleEnum.OneMonth,
        cases: [
          {
            name: '開始日と同じ日 → 翌月同日',
            startedAt: new Date('2025-01-01T00:00:00.000Z'),
            mockNow: new Date('2025-01-01T00:00:00.000Z'),
            expected: new Date('2025-02-01T00:00:00.000Z'),
          },
          {
            name: '開始から1ヶ月半経過 → 2ヶ月後の同日',
            startedAt: new Date('2025-01-01T00:00:00.000Z'),
            mockNow: new Date('2025-02-15T00:00:00.000Z'),
            expected: new Date('2025-03-01T00:00:00.000Z'),
          },
          {
            name: '月末開始で翌月に存在しない日付 → 翌月末',
            startedAt: new Date('2025-01-31T00:00:00.000Z'),
            mockNow: new Date('2025-02-15T00:00:00.000Z'),
            expected: new Date('2025-02-28T00:00:00.000Z'),
          },
          {
            name: '必ず指定日時より未来になること',
            startedAt: new Date('2025-01-31T00:00:00.000Z'),
            mockNow: new Date('2025-02-28T23:59:59.999Z'),
            expected: new Date('2025-03-31T00:00:00.000Z'),
          },
        ],
      },

      // 3ヶ月サイクルのテスト
      {
        cycle: SubscriptionCycleEnum.ThreeMonths,
        cases: [
          {
            name: '開始日と同じ日 → 3ヶ月後の同日',
            startedAt: new Date('2025-01-01T00:00:00.000Z'),
            mockNow: new Date('2025-01-01T00:00:00.000Z'),
            expected: new Date('2025-04-01T00:00:00.000Z'),
          },
          {
            name: '開始から2ヶ月経過 → 3ヶ月後の同日',
            startedAt: new Date('2025-01-01T00:00:00.000Z'),
            mockNow: new Date('2025-03-15T00:00:00.000Z'),
            expected: new Date('2025-04-01T00:00:00.000Z'),
          },
          {
            name: '開始から1サイクル+2ヶ月経過 → 次のサイクル同日',
            startedAt: new Date('2025-01-01T00:00:00.000Z'),
            mockNow: new Date('2025-06-15T00:00:00.000Z'),
            expected: new Date('2025-07-01T00:00:00.000Z'),
          },
        ],
      },

      // 6ヶ月サイクルのテスト
      {
        cycle: SubscriptionCycleEnum.SixMonths,
        cases: [
          {
            name: '開始日と同じ日 → 6ヶ月後の同日',
            startedAt: new Date('2025-01-01T00:00:00.000Z'),
            mockNow: new Date('2025-01-01T00:00:00.000Z'),
            expected: new Date('2025-07-01T00:00:00.000Z'),
          },
          {
            name: '開始から4ヶ月経過 → 6ヶ月後の同日',
            startedAt: new Date('2025-01-01T00:00:00.000Z'),
            mockNow: new Date('2025-05-15T00:00:00.000Z'),
            expected: new Date('2025-07-01T00:00:00.000Z'),
          },
          {
            name: '開始から1サイクル+2ヶ月経過 → 次のサイクル同日',
            startedAt: new Date('2025-01-01T00:00:00.000Z'),
            mockNow: new Date('2025-09-15T00:00:00.000Z'),
            expected: new Date('2026-01-01T00:00:00.000Z'),
          },
        ],
      },

      // 年次サイクルのテスト
      {
        cycle: SubscriptionCycleEnum.OneYear,
        cases: [
          {
            name: '開始日と同じ日 → 1年後の同日',
            startedAt: new Date('2025-01-01T00:00:00.000Z'),
            mockNow: new Date('2025-01-01T00:00:00.000Z'),
            expected: new Date('2026-01-01T00:00:00.000Z'),
          },
          {
            name: '開始から半年経過 → 1年後の同日',
            startedAt: new Date('2025-01-01T00:00:00.000Z'),
            mockNow: new Date('2025-07-15T00:00:00.000Z'),
            expected: new Date('2026-01-01T00:00:00.000Z'),
          },
          {
            name: '開始から1年+1ヶ月経過 → 2年後の同日',
            startedAt: new Date('2025-01-01T00:00:00.000Z'),
            mockNow: new Date('2026-03-15T00:00:00.000Z'),
            expected: new Date('2027-01-01T00:00:00.000Z'),
          },
          {
            name: 'うるう年を含む: 開始2/29 → 翌年は2/28',
            startedAt: new Date('2024-02-29T00:00:00.000Z'),
            mockNow: new Date('2024-03-15T00:00:00.000Z'),
            expected: new Date('2025-02-28T00:00:00.000Z'),
          },
        ],
      },
    ];

    // 各サイクルのテストケースを実行
    describe.each(cycleTestGroups)('$cycle サイクル', ({ cycle, cases }) => {
      it.each(cases)('$name', ({ startedAt, mockNow, expected }) => {
        // テスト内で現在時刻を設定
        vi.spyOn(DateUtils.create, 'now').mockImplementation(() => mockNow);

        // サブスクリプションを作成して次回支払日を計算
        const subscription = createSubscription({ cycle, startedAt });
        const result = Subscription.getNextPaymentAt(subscription)(mockNow);

        // 結果を検証
        expect(result).toEqual(expected);
      });
    });

    it('無効なサイクルの場合、エラーをスローすること', () => {
      expect(() => {
        const subscription = createSubscription({
          cycle: 'InvalidCycle' as SubscriptionCycleEnum,
          startedAt: new Date(2025, 0, 1),
        });
        Subscription.getNextPaymentAt(subscription)(new Date(2025, 0, 1));
      }).toThrow('Invalid subscription cycle: InvalidCycle');
    });
  });

  describe('getPaymentDatesInMonth', () => {
    // 指定した月での支払日をすべて取得する
    it('指定した月での支払日をすべて取得する', () => {
      const subscription = createSubscription({ cycle: SubscriptionCycleEnum.OneMonth, startedAt: new Date('2025-01-01T00:00:00.000Z') });

      const result = Subscription.getPaymentDatesInMonth(subscription)(MOCK_NOW);
      expect(result).toEqual([subscription.startedAt]);
    });
  });

  describe('update', () => {
    // 基本的な更新シナリオをテスト
    describe('基本的な更新', () => {
      it('複数フィールドの更新が正しく適用されること', () => {
        // 準備：基本サブスクリプション
        const subscription = createSubscription({
          cycle: SubscriptionCycleEnum.OneMonth,
          startedAt: new Date('2025-01-01T00:00:00.000Z'),
        });

        // 実行：更新
        const updated = Subscription.update(subscription)({
          name: '更新後の名前',
          price: '2000',
          description: '詳細説明',
        });

        // 検証：更新されたフィールド
        expect(updated.name).toBe('更新後の名前');
        expect(updated.price).toBe('2000');
        expect(updated.description).toBe('詳細説明');

        // 検証：更新されていないフィールド
        expect(updated.id).toBe(subscription.id);
        expect(updated.userId).toBe(subscription.userId);
        expect(updated.cycle).toBe(subscription.cycle);
        expect(updated.startedAt).toEqual(subscription.startedAt);

        // 検証：updatedAtが更新されていること
        expect(updated.updatedAt).toEqual(MOCK_NOW);

        // 検証：expiredAtはnullのままであること（キャンセルしていないため）
        expect(updated.expiredAt).toBeNull();
      });

      it('サイクルを変更しても期限日が適切に計算されること', () => {
        // 準備：基本サブスクリプション
        const subscription = createSubscription({
          cycle: SubscriptionCycleEnum.OneMonth,
          startedAt: new Date('2025-01-01T00:00:00.000Z'),
        });

        // 実行：サイクルを更新
        const updated = Subscription.update(subscription)({
          cycle: SubscriptionCycleEnum.OneYear,
        });

        // 検証：サイクルが更新されていること
        expect(updated.cycle).toBe(SubscriptionCycleEnum.OneYear);

        // 検証：期限日はnullのままであること（キャンセルしていないため）
        expect(updated.expiredAt).toBeNull();
      });
    });

    // キャンセル関連の更新をテスト
    describe('キャンセル関連の更新', () => {
      it('新規キャンセル時に期限日が正しく設定されること', () => {
        // 準備：基本サブスクリプション（月次）
        const subscription = createSubscription({
          cycle: SubscriptionCycleEnum.OneMonth,
          startedAt: new Date('2025-01-01T00:00:00.000Z'),
        });

        // 実行：キャンセル処理
        const cancelledAt = new Date('2025-01-15T00:00:00.000Z');
        const updated = Subscription.update(subscription)({ cancelledAt });

        // 検証：キャンセル日と期限日
        expect(updated.cancelledAt).toEqual(cancelledAt);
        expect(updated.expiredAt).toEqual(DateUtils.modify.addMilliseconds(new Date('2025-02-01T00:00:00.000Z'), -1));
      });

      it('キャンセル済みサブスクリプションのキャンセル日変更', () => {
        // 準備：キャンセル済みサブスクリプション
        const subscription = createSubscription({
          cycle: SubscriptionCycleEnum.OneMonth,
          startedAt: new Date('2025-01-01T00:00:00.000Z'),
          cancelledAt: new Date('2025-01-15T00:00:00.000Z'),
        });

        // 実行：キャンセル日を次の月に変更
        const newCancelledAt = new Date('2025-02-02T00:00:00.000Z');
        const updated = Subscription.update(subscription)({ cancelledAt: newCancelledAt });

        // 検証：新しいキャンセル日と期限日
        expect(updated.cancelledAt).toEqual(newCancelledAt);
        expect(updated.expiredAt).toEqual(new Date('2025-02-28T23:59:59.999Z'));
      });

      it('キャンセル解除で期限日がnullになること', () => {
        // 準備：キャンセル済みサブスクリプション
        const subscription = createSubscription({
          cycle: SubscriptionCycleEnum.OneMonth,
          startedAt: new Date('2025-01-01T00:00:00.000Z'),
          cancelledAt: new Date('2025-01-15T00:00:00.000Z'),
        });

        // 実行：キャンセル解除
        const updated = Subscription.update(subscription)({ cancelledAt: null });

        // 検証：キャンセル日と期限日がnullになっていること
        expect(updated.cancelledAt).toBeNull();
        expect(updated.expiredAt).toBeNull();
      });
    });

    // 複合的な更新シナリオをテスト
    describe('複合的な更新', () => {
      it('サイクルとキャンセル状態の同時変更が正しく反映されること', () => {
        // 準備：基本サブスクリプション（月次）
        const subscription = createSubscription({
          cycle: SubscriptionCycleEnum.OneMonth,
          startedAt: new Date('2025-01-01T00:00:00.000Z'),
        });

        // 実行：サイクルとキャンセル状態を同時に変更
        const updated = Subscription.update(subscription)({
          cycle: SubscriptionCycleEnum.ThreeMonths,
          cancelledAt: new Date('2025-01-15T00:00:00.000Z'),
        });

        // 検証：サイクルとキャンセル日が更新されていること
        expect(updated.cycle).toBe(SubscriptionCycleEnum.ThreeMonths);
        expect(updated.cancelledAt).toEqual(new Date('2025-01-15T00:00:00.000Z'));

        // 検証：期限日が新しいサイクルに基づいて計算されていること
        expect(updated.expiredAt).toEqual(new Date('2025-03-31T23:59:59.999Z'));
      });

      it('すべての属性を一括更新できること', () => {
        // 準備：基本サブスクリプション
        const subscription = createSubscription({
          cycle: SubscriptionCycleEnum.OneMonth,
          startedAt: new Date('2025-01-01T00:00:00.000Z'),
        });

        // 実行：全フィールド更新
        const updated = Subscription.update(subscription)({
          name: '新しいサブスクリプション',
          price: '5000',
          description: '更新後の説明',
          cycle: SubscriptionCycleEnum.OneYear,
          startedAt: new Date('2025-02-01T00:00:00.000Z'),
          cancelledAt: new Date('2025-06-15T00:00:00.000Z'),
        });

        // 検証：すべてのフィールドが更新されていること
        expect(updated.name).toBe('新しいサブスクリプション');
        expect(updated.price).toBe('5000');
        expect(updated.description).toBe('更新後の説明');
        expect(updated.cycle).toBe(SubscriptionCycleEnum.OneYear);
        expect(updated.startedAt).toEqual(new Date('2025-02-01T00:00:00.000Z'));
        expect(updated.cancelledAt).toEqual(new Date('2025-06-15T00:00:00.000Z'));

        // 検証：更新されないフィールド
        expect(updated.id).toBe(subscription.id);
        expect(updated.userId).toBe(subscription.userId);

        // 検証：期限日が正しく計算されていること
        expect(updated.expiredAt).toEqual(new Date('2026-01-31T23:59:59.999Z'));
      });
    });
  });

  // ----- _calculateExpiredAt のテスト -----
  describe('期限切れ日の計算', () => {
    // テストケース定義
    interface ExpiredAtTestCase {
      name: string;
      cycle: SubscriptionCycleEnum;
      startedAt: Date;
      cancelledAt: Date;
      expectedExpiredAt: Date;
    }

    // テストケース一覧
    const expiredAtTestCases: ExpiredAtTestCase[] = [
      // 月次サイクルのテスト
      {
        name: '月次：サイクル開始日にキャンセル → 当月末が期限日',
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: new Date('2025-01-01T00:00:00.000Z'),
        cancelledAt: new Date('2025-01-01T00:00:00.000Z'),
        expectedExpiredAt: new Date('2025-01-31T23:59:59.999Z'),
      },
      {
        name: '月次：サイクル中間でキャンセル → 当月末が期限日',
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: new Date('2025-01-01T00:00:00.000Z'),
        cancelledAt: new Date('2025-01-15T00:00:00.000Z'),
        expectedExpiredAt: new Date('2025-01-31T23:59:59.999Z'),
      },
      {
        name: '月次：翌月キャンセル → 翌月末が期限日',
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: new Date('2025-01-01T00:00:00.000Z'),
        cancelledAt: new Date('2025-02-15T00:00:00.000Z'),
        expectedExpiredAt: new Date('2025-02-28T23:59:59.999Z'),
      },

      // 3ヶ月サイクルのテスト
      {
        name: '3ヶ月：サイクル開始日にキャンセル → 3ヶ月後末日が期限日',
        cycle: SubscriptionCycleEnum.ThreeMonths,
        startedAt: new Date('2025-01-01T00:00:00.000Z'),
        cancelledAt: new Date('2025-01-01T00:00:00.000Z'),
        expectedExpiredAt: new Date('2025-03-31T23:59:59.999Z'),
      },
      {
        name: '3ヶ月：2ヶ月目にキャンセル → 3ヶ月後末日が期限日',
        cycle: SubscriptionCycleEnum.ThreeMonths,
        startedAt: new Date('2025-01-01T00:00:00.000Z'),
        cancelledAt: new Date('2025-02-15T00:00:00.000Z'),
        expectedExpiredAt: new Date('2025-03-31T23:59:59.999Z'),
      },
      {
        name: '3ヶ月：次サイクル内キャンセル → 次サイクル末日が期限日',
        cycle: SubscriptionCycleEnum.ThreeMonths,
        startedAt: new Date('2025-01-01T00:00:00.000Z'),
        cancelledAt: new Date('2025-04-15T00:00:00.000Z'),
        expectedExpiredAt: new Date('2025-06-30T23:59:59.999Z'),
      },

      // 6ヶ月サイクルのテスト
      {
        name: '6ヶ月：サイクル開始日にキャンセル → 6ヶ月後末日が期限日',
        cycle: SubscriptionCycleEnum.SixMonths,
        startedAt: new Date('2025-01-01T00:00:00.000Z'),
        cancelledAt: new Date('2025-01-01T00:00:00.000Z'),
        expectedExpiredAt: new Date('2025-06-30T23:59:59.999Z'),
      },

      // 年次サイクルのテスト
      {
        name: '年次：サイクル開始日にキャンセル → 1年後末日が期限日',
        cycle: SubscriptionCycleEnum.OneYear,
        startedAt: new Date('2025-01-01T00:00:00.000Z'),
        cancelledAt: new Date('2025-01-01T00:00:00.000Z'),
        expectedExpiredAt: new Date('2025-12-31T23:59:59.999Z'),
      },
      {
        name: '年次：半年後にキャンセル → 1年後末日が期限日',
        cycle: SubscriptionCycleEnum.OneYear,
        startedAt: new Date('2025-01-01T00:00:00.000Z'),
        cancelledAt: new Date('2025-06-15T00:00:00.000Z'),
        expectedExpiredAt: new Date('2025-12-31T23:59:59.999Z'),
      },
    ];

    // 期限切れ日計算のテスト実行
    it.each(expiredAtTestCases)('$name', ({ cycle, startedAt, cancelledAt, expectedExpiredAt }) => {
      // サブスクリプション作成
      const subscription = createSubscription({ cycle, startedAt });

      // 更新実行（Subscription.updateを介して_calculateExpiredAtをテスト）
      const updated = Subscription.update(subscription)({ cancelledAt });

      // 期限日検証
      expect(updated.expiredAt).toEqual(expectedExpiredAt);
    });

    it('キャンセル日がnullの場合、expiredAtもnullになること', () => {
      // サブスクリプション作成（キャンセル済み）
      const subscription = createSubscription({
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: new Date('2025-01-01 00:00:00'),
        cancelledAt: new Date('2025-01-15 00:00:00'),
      });

      // キャンセル解除
      const updated = Subscription.update(subscription)({ cancelledAt: null });

      // 期限日がnullになることを検証
      expect(updated.expiredAt).toBeNull();
    });
  });

  // nextPaymentAtとexpiredAtの関係を検証するテスト
  describe('nextPaymentAtとexpiredAtの関係', () => {
    interface PaymentExpiryTestCase {
      name: string;
      cycle: SubscriptionCycleEnum;
      startedAt: Date;
      cancelledAt: Date;
      currentDate: Date;
    }

    // テストケース一覧
    const testCases: PaymentExpiryTestCase[] = [
      {
        name: '月次サイクル：nextPaymentAtはexpiredAtの直後であること',
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: new Date('2025-01-01 00:00:00'),
        cancelledAt: new Date('2025-01-15 00:00:00'),
        currentDate: new Date('2025-01-20 00:00:00'),
      },
      {
        name: '3ヶ月サイクル：nextPaymentAtはexpiredAtの直後であること',
        cycle: SubscriptionCycleEnum.ThreeMonths,
        startedAt: new Date('2025-01-01 00:00:00'),
        cancelledAt: new Date('2025-01-15 00:00:00'),
        currentDate: new Date('2025-01-20 00:00:00'),
      },
      {
        name: '年次サイクル：nextPaymentAtはexpiredAtの直後であること',
        cycle: SubscriptionCycleEnum.OneYear,
        startedAt: new Date('2025-01-01 00:00:00'),
        cancelledAt: new Date('2025-06-15 00:00:00'),
        currentDate: new Date('2025-07-01 00:00:00'),
      },
    ];

    it.each(testCases)('$name', ({ cycle, startedAt, cancelledAt, currentDate }) => {
      // サブスクリプション作成
      const subscription = createSubscription({ cycle, startedAt });

      // 更新実行
      const updated = Subscription.update(subscription)({ cancelledAt });

      // 期限日と次回支払日の取得
      const expiredAt = updated.expiredAt;
      const nextPaymentAt = Subscription.getNextPaymentAt(updated)(currentDate);

      // 検証:
      // 1. 両者がnullでないこと
      expect(expiredAt).not.toBeNull();
      expect(nextPaymentAt).not.toBeNull();

      // 2. nextPaymentAtがexpiredAtの直後（1ミリ秒後）であること
      if (expiredAt && nextPaymentAt) {
        const expectedNextPayment = new Date(expiredAt);
        expectedNextPayment.setMilliseconds(expectedNextPayment.getMilliseconds() + 1);

        // 年月日が一致
        expect(nextPaymentAt.getFullYear()).toBe(expectedNextPayment.getFullYear());
        expect(nextPaymentAt.getMonth()).toBe(expectedNextPayment.getMonth());
        expect(nextPaymentAt.getDate()).toBe(expectedNextPayment.getDate());

        // 時間部分はnextPaymentAtが00:00:00となるため完全一致はしない
        // 代わりに日付の差が0であることを確認（同じ日）
        const timeDiffInDays = Math.abs((nextPaymentAt.getTime() - expiredAt.getTime()) / (1000 * 60 * 60 * 24));
        expect(timeDiffInDays).toBeLessThan(1);
      }
    });
  });
});
