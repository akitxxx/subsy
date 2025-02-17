import { SubscriptionCycleEnum } from '../../../../../enums/subscription/subscriptionCycle.enum';
import { SubscriptionStatusEnum } from '../../../../../enums/subscription/subscriptionStatus.enum';
import { CurrencyEnum } from '../../../../../enums/currency.enum';
import { describe, it, expect } from 'vitest';
import { Subscription } from './subscription.logic';

describe('Subscription', () => {
  const baseSubscription = {
    id: '1',
    userId: '1',
    name: 'Test Subscription',
    price: '1000',
    currency: CurrencyEnum.JPY,
    cycle: SubscriptionCycleEnum.OneMonth,
    startedAt: new Date('2025-01-01'),
    cancelledAt: null,
    expiredAt: new Date('2025-02-01'),
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  describe('getIsExpired', () => {
    it('expiredAtがnullの場合はfalseを返すこと', () => {
      const subscription = {
        ...baseSubscription,
        expiredAt: null,
      };
      const now = new Date('2025-01-15');
      expect(Subscription.getIsExpired(subscription)(now)).toBe(false);
    });

    it('expiredAtが現在日時より前の場合はtrueを返すこと', () => {
      const subscription = {
        ...baseSubscription,
        expiredAt: new Date('2025-01-01'),
      };
      const now = new Date('2025-01-15');
      expect(Subscription.getIsExpired(subscription)(now)).toBe(true);
    });

    it('expiredAtが現在日時より後の場合はfalseを返すこと', () => {
      const subscription = {
        ...baseSubscription,
        expiredAt: new Date('2025-02-01'),
      };
      const now = new Date('2025-01-15');
      expect(Subscription.getIsExpired(subscription)(now)).toBe(false);
    });
  });

  describe('update', () => {
    it('expiredAtを直接更新できないこと', () => {
      const subscription = {
        ...baseSubscription,
        expiredAt: new Date('2025-01-01'),
      };
      const props = {
        cycle: SubscriptionCycleEnum.ThreeMonths,
      } as const;
      const updated = Subscription.update(subscription)(props);
      expect(updated.expiredAt).toEqual(new Date('2025-04-01'));
    });

    it('cycleが変更された場合にexpiredAtが再計算されること', () => {
      const subscription = {
        ...baseSubscription,
        expiredAt: new Date('2025-02-01'),
      };
      const props = {
        cycle: SubscriptionCycleEnum.ThreeMonths,
      };
      const updated = Subscription.update(subscription)(props);
      expect(updated.expiredAt).toEqual(new Date('2025-04-01'));
    });

    it('startedAtが変更された場合にexpiredAtが再計算されること', () => {
      const subscription = {
        ...baseSubscription,
        expiredAt: new Date('2025-02-01'),
      };
      const props = {
        startedAt: new Date('2025-02-01'),
      };
      const updated = Subscription.update(subscription)(props);
      expect(updated.expiredAt).toEqual(new Date('2025-03-01'));
    });
  });

  describe('calculateExpiredAt', () => {
    const startDate = new Date('2025-01-01');

    it('OneMonthの場合、1ヶ月後の日付を返すこと', () => {
      const result = Subscription.calculateExpiredAt(startDate, SubscriptionCycleEnum.OneMonth);
      expect(result).toEqual(new Date('2025-02-01'));
    });

    it('ThreeMonthsの場合、3ヶ月後の日付を返すこと', () => {
      const result = Subscription.calculateExpiredAt(startDate, SubscriptionCycleEnum.ThreeMonths);
      expect(result).toEqual(new Date('2025-04-01'));
    });

    it('SixMonthsの場合、6ヶ月後の日付を返すこと', () => {
      const result = Subscription.calculateExpiredAt(startDate, SubscriptionCycleEnum.SixMonths);
      expect(result).toEqual(new Date('2025-07-01'));
    });

    it('OneYearの場合、1年後の日付を返すこと', () => {
      const result = Subscription.calculateExpiredAt(startDate, SubscriptionCycleEnum.OneYear);
      expect(result).toEqual(new Date('2026-01-01'));
    });
  });
});
