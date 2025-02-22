import { SubscriptionCycleEnum } from '@/enums/subscription/subscriptionCycle.enum';
import { describe, expect, it } from 'vitest';
import { Subscription, _calculateExpiredAt } from './subscription.logic';

describe('Subscription', () => {
  describe('calculateExpiredAt', () => {
    describe.each([
      {
        cycle: SubscriptionCycleEnum.OneMonth,
        cases: [
          {
            name: '開始日と同日にキャンセルした場合、現在のサイクルの終了日を返すこと',
            startedAt: new Date('2025-01-01 00:00:00'),
            cancelledAt: new Date('2025-01-01 00:00:00'),
            expected: new Date('2025-02-01 00:00:00'),
          },
          {
            name: 'サイクル途中でキャンセルした場合、現在のサイクルの終了日を返すこと',
            startedAt: new Date('2025-01-01 00:00:00'),
            cancelledAt: new Date('2025-01-15 00:00:00'),
            expected: new Date('2025-02-01 00:00:00'),
          },
          {
            name: 'サイクルをまたいでキャンセルした場合、現在のサイクルの終了日を返すこと',
            startedAt: new Date('2025-01-01 00:00:00'),
            cancelledAt: new Date('2025-02-15 00:00:00'),
            expected: new Date('2025-03-01 00:00:00'),
          },
        ],
      },
      {
        cycle: SubscriptionCycleEnum.ThreeMonths,
        cases: [
          {
            name: '開始日と同日にキャンセルした場合、現在のサイクルの終了日を返すこと',
            startedAt: new Date('2025-01-01 00:00:00'),
            cancelledAt: new Date('2025-01-01 00:00:00'),
            expected: new Date('2025-04-01 00:00:00'),
          },
          {
            name: 'サイクル途中でキャンセルした場合、現在のサイクルの終了日を返すこと',
            startedAt: new Date('2025-01-01 00:00:00'),
            cancelledAt: new Date('2025-02-15 00:00:00'),
            expected: new Date('2025-04-01 00:00:00'),
          },
          {
            name: 'サイクルをまたいでキャンセルした場合、現在のサイクルの終了日を返すこと',
            startedAt: new Date('2025-01-01 00:00:00'),
            cancelledAt: new Date('2025-04-15 00:00:00'),
            expected: new Date('2025-07-01 00:00:00'),
          },
        ],
      },
      {
        cycle: SubscriptionCycleEnum.SixMonths,
        cases: [
          {
            name: '開始日と同日にキャンセルした場合、現在のサイクルの終了日を返すこと',
            startedAt: new Date('2025-01-01 00:00:00'),
            cancelledAt: new Date('2025-01-01 00:00:00'),
            expected: new Date('2025-07-01 00:00:00'),
          },
          {
            name: 'サイクル途中でキャンセルした場合、現在のサイクルの終了日を返すこと',
            startedAt: new Date('2025-01-01 00:00:00'),
            cancelledAt: new Date('2025-03-15 00:00:00'),
            expected: new Date('2025-07-01 00:00:00'),
          },
          {
            name: 'サイクルをまたいでキャンセルした場合、現在のサイクルの終了日を返すこと',
            startedAt: new Date('2025-01-01 00:00:00'),
            cancelledAt: new Date('2025-07-15 00:00:00'),
            expected: new Date('2026-01-01 00:00:00'),
          },
        ],
      },
      {
        cycle: SubscriptionCycleEnum.OneYear,
        cases: [
          {
            name: '開始日と同日にキャンセルした場合、現在のサイクルの終了日を返すこと',
            startedAt: new Date('2025-01-01 00:00:00'),
            cancelledAt: new Date('2025-01-01 00:00:00'),
            expected: new Date('2026-01-01 00:00:00'),
          },
          {
            name: 'サイクル途中でキャンセルした場合、現在のサイクルの終了日を返すこと',
            startedAt: new Date('2025-01-01 00:00:00'),
            cancelledAt: new Date('2025-06-15 00:00:00'),
            expected: new Date('2026-01-01 00:00:00'),
          },
          {
            name: 'サイクルをまたいでキャンセルした場合、現在のサイクルの終了日を返すこと',
            startedAt: new Date('2025-01-01 00:00:00'),
            cancelledAt: new Date('2026-01-15 00:00:00'),
            expected: new Date('2027-01-01 00:00:00'),
          },
        ],
      },
    ])('$cycle', ({ cycle, cases }) => {
      it.each(cases)(`${cycle} $name`, ({ startedAt, cancelledAt, expected }) => {
        const result = _calculateExpiredAt({ cycle, startedAt, cancelledAt });
        expect(result).toEqual(expected);
      });
    });

    it('無効なサイクルの場合、エラーをスローすること', () => {
      expect(() => {
        _calculateExpiredAt({
          cycle: 'InvalidCycle' as SubscriptionCycleEnum,
          startedAt: new Date('2025-01-01 00:00:00'),
          cancelledAt: new Date('2025-01-01 00:00:00'),
        });
      }).toThrow('Invalid subscription cycle: InvalidCycle');
    });
  });
});
