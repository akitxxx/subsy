import type { SubscriptionRepository } from '@/api/shared/domain/subscription';
import { FunctionName } from '@/api/shared/lib/openai';
import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { LanguageEnum } from '@/shared/enums/language.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { DateUtils } from '@/shared/utils/date.util';
import { describe, expect, it, vi } from 'vitest';
import { executeFunctionByName } from './executionFunctionByName.workflow';

describe('executeFunctionByName', () => {
  describe('handleGetMonthlyTotal', () => {
    // 現在の日付をモック
    const now = new Date('2025-03-15T00:00:00.000Z');
    vi.spyOn(DateUtils.create, 'now').mockReturnValue(now);
    
    // テスト用のサブスクリプションデータ
    const createTestSubscriptions = () => [
      // 今月支払い予定のサブスクリプション（円）
      {
        id: '1',
        userId: 'user1',
        name: 'Netflix',
        price: '1500',
        currency: CurrencyEnum.Jpy,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: new Date('2025-02-15T00:00:00.000Z'),
        cancelledAt: null,
        expiredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        description: null,
      },
      // 今月支払い予定のサブスクリプション（ドル）
      {
        id: '2',
        userId: 'user1',
        name: 'Spotify',
        price: '9.99',
        currency: CurrencyEnum.Usd,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: new Date('2025-02-20T00:00:00.000Z'),
        cancelledAt: null,
        expiredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        description: null,
      },
      // 来月支払い予定のサブスクリプション
      {
        id: '3',
        userId: 'user1',
        name: 'Amazon Prime',
        price: '500',
        currency: CurrencyEnum.Jpy,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: new Date('2025-02-25T00:00:00.000Z'),
        cancelledAt: null,
        expiredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        description: null,
      },
      // 期限切れのサブスクリプション
      {
        id: '4',
        userId: 'user1',
        name: 'Old Service',
        price: '1000',
        currency: CurrencyEnum.Jpy,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: new Date('2024-01-01T00:00:00.000Z'),
        cancelledAt: new Date('2024-12-31T00:00:00.000Z'),
        expiredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        description: null,
      },
    ];

    it('日本語で今月の支払い合計を問い合わせた場合、円換算で合計金額を返すこと', async () => {
      // given
      const subscriptions = createTestSubscriptions();
      const userId = 'user1';
      
      // when
      const mockRepository: SubscriptionRepository = {
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findManyByUserId: vi.fn(),
        findById: vi.fn(),
      };
      
      const result = await executeFunctionByName({ subscriptionRepository: mockRepository })({
        userId,
        subscriptions,
        functionCall: {
          name: FunctionName.getMonthlyTotal,
          args: { language: LanguageEnum.Japanese },
        },
      });
      
      // then
      expect(result.message).toContain('今月の支払い予定合計: ¥');
      expect(result.message).toContain('2件');
    });

    it('英語で今月の支払い合計を問い合わせた場合、ドル換算で合計金額を返すこと', async () => {
      // given
      const subscriptions = createTestSubscriptions();
      const userId = 'user1';
      
      // when
      const mockRepository: SubscriptionRepository = {
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findManyByUserId: vi.fn(),
        findById: vi.fn(),
      };
      
      const result = await executeFunctionByName({ subscriptionRepository: mockRepository })({
        userId,
        subscriptions,
        functionCall: {
          name: FunctionName.getMonthlyTotal,
          args: { language: LanguageEnum.English },
        },
      });
      
      // then
      expect(result.message).toContain('Total payments due for this month: $');
      expect(result.message).toContain('2 subscriptions');
    });
    
    it('特定の月（来月）の支払い合計を問い合わせた場合、その月の合計金額を返すこと', async () => {
      // given
      const subscriptions = createTestSubscriptions();
      const userId = 'user1';
      
      // 来月（4月）を指定
      const nextMonth = now.getMonth() + 2; // 現在3月なので+2で4月
      const year = now.getFullYear();
      
      // when
      const mockRepository: SubscriptionRepository = {
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findManyByUserId: vi.fn(),
        findById: vi.fn(),
      };
      
      const result = await executeFunctionByName({ subscriptionRepository: mockRepository })({
        userId,
        subscriptions,
        functionCall: {
          name: FunctionName.getMonthlyTotal,
          args: { 
            language: LanguageEnum.Japanese,
            year: year,
            month: nextMonth
          },
        },
      });
      
      // then
      expect(result.message).toContain(`${year}年${nextMonth}月の支払い予定合計: ¥`);
      expect(result.message).toContain('1件');
    });
  });
});
