import { Subscription } from '@/api/shared/domain/subscription';
import { type DrizzleClient, getDrizzleClient } from '@/api/shared/lib/db/drizzle';
import { FunctionName } from '@/api/shared/lib/openai/subscription-functions';
import { cleanupDB } from '@/api/shared/test/dbHelper';
import { createActiveUser, createSubscription } from '@/api/shared/test/testDataFactory';
import { SubscriptionRepository } from '@/api/shared/domain/subscription/subscription.repository';
import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { LanguageEnum } from '@/shared/enums/language.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { DateUtils } from '@/shared/utils/date.util';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { executeFunctionByName } from './executionFunctionByName.workflow';

describe('executeFunctionByName', () => {
  // ========== setup ==========
  const db = getDrizzleClient();
  const subscriptionRepository = SubscriptionRepository({ db });
  
  // 現在の日付をモック
  const now = new Date('2025-03-15T00:00:00.000Z');
  
  beforeEach(async () => {
    await cleanupDB(db);
    vi.spyOn(DateUtils.create, 'now').mockReturnValue(now);
  });

  // ========== test ==========
  describe('handleGetMonthlyTotal', () => {
    it('日本語で今月の支払い合計を問い合わせた場合、円換算で合計金額を返すこと', async () => {
      // given
      const user = await createActiveUser(db)();
      await createSubscription(db)({
        userId: user.id,
        name: 'Netflix',
        price: '1500',
        currency: CurrencyEnum.Jpy,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: new Date('2025-02-15T00:00:00.000Z'),
      });
      await createSubscription(db)({
        userId: user.id,
        name: 'Spotify',
        price: '9.99',
        currency: CurrencyEnum.Usd,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: new Date('2025-02-20T00:00:00.000Z'),
      });
      
      // when
      const result = await executeFunctionByName({ subscriptionRepository })({
        userId: user.id,
        subscriptions: await subscriptionRepository.findManyByUserId({ userId: user.id }),
        functionCall: {
          name: FunctionName.getMonthlyTotal,
          args: { 
            language: LanguageEnum.Japanese,
            targetDate: now.toISOString(),
          },
        },
      });
      
      // then
      expect(result.message).toContain('今月の支払い予定合計: ¥');
      expect(result.message).toContain('2件');
    });

    it('英語で今月の支払い合計を問い合わせた場合、ドル換算で合計金額を返すこと', async () => {
      // given
      const user = await createActiveUser(db)();
      await createSubscription(db)({
        userId: user.id,
        name: 'Netflix',
        price: '1500',
        currency: CurrencyEnum.Jpy,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: new Date('2025-02-15T00:00:00.000Z'),
      });
      await createSubscription(db)({
        userId: user.id,
        name: 'Spotify',
        price: '9.99',
        currency: CurrencyEnum.Usd,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: new Date('2025-02-20T00:00:00.000Z'),
      });
      
      // when
      const result = await executeFunctionByName({ subscriptionRepository })({
        userId: user.id,
        subscriptions: await subscriptionRepository.findManyByUserId({ userId: user.id }),
        functionCall: {
          name: FunctionName.getMonthlyTotal,
          args: { 
            language: LanguageEnum.English,
            targetDate: now.toISOString(),
          },
        },
      });
      
      // then
      expect(result.message).toContain('Total payments due for this month: $');
      expect(result.message).toContain('2 subscriptions');
    });
    
    it('特定の月（来月）の支払い合計を問い合わせた場合、その月の合計金額を返すこと', async () => {
      // given
      const user = await createActiveUser(db)();
      await createSubscription(db)({
        userId: user.id,
        name: 'Amazon Prime',
        price: '500',
        currency: CurrencyEnum.Jpy,
        cycle: SubscriptionCycleEnum.OneMonth,
        startedAt: new Date('2025-02-25T00:00:00.000Z'),
      });
      
      // 来月（4月）の日付を作成
      const nextMonthDate = DateUtils.modify.addMonths(now, 1);
      
      // when
      const result = await executeFunctionByName({ subscriptionRepository })({
        userId: user.id,
        subscriptions: await subscriptionRepository.findManyByUserId({ userId: user.id }),
        functionCall: {
          name: FunctionName.getMonthlyTotal,
          args: { 
            language: LanguageEnum.Japanese,
            targetDate: nextMonthDate.toISOString(),
          },
        },
      });
      
      // then
      const nextMonthYear = nextMonthDate.getFullYear();
      const nextMonth = nextMonthDate.getMonth() + 1;
      expect(result.message).toContain(`${nextMonthYear}年${nextMonth}月の支払い予定合計: ¥`);
      expect(result.message).toContain('1件');
    });
  });
});
