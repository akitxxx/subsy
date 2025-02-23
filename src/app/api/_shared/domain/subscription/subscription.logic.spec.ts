import { CurrencyEnum } from '@/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/enums/subscription/subscriptionCycle.enum';
import { describe, expect, it } from 'vitest';
import { vi } from 'vitest';
import type { SubscriptionEntity } from './subscription.entity';
import { Subscription } from './subscription.logic';

describe('getNextPaymentAt', () => {
  describe.each([
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
  ])('$cycle', ({ cycle, cases }) => {
    it.each(cases)(`${cycle} $name`, ({ startedAt, mockNow, expected }) => {
      if (mockNow) {
        vi.setSystemTime(mockNow);
      }
      const subscription = createSubscription({ cycle, startedAt });
      const result = Subscription.getNextPaymentAt(subscription);
      expect(result).toEqual(expected);
      if (mockNow) {
        vi.useRealTimers();
      }
    });
  });

  it('無効なサイクルの場合、エラーをスローすること', () => {
    expect(() => {
      const subscription = createSubscription({
        cycle: 'InvalidCycle' as SubscriptionCycleEnum,
        startedAt: new Date('2025-01-01 00:00:00'),
      });
      Subscription.getNextPaymentAt(subscription);
    }).toThrow('Invalid subscription cycle: InvalidCycle');
  });
});

const createSubscription = (params: Partial<SubscriptionEntity> & Pick<SubscriptionEntity, 'cycle' | 'startedAt'>): SubscriptionEntity => {
  return {
    id: 'test-id',
    name: 'Test Subscription',
    price: '1000',
    currency: CurrencyEnum.JPY,
    userId: 'test-user-id',
    cancelledAt: null,
    expiredAt: null,
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...params,
  };
};
