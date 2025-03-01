import { Subscription, type SubscriptionEntity } from '@/api/shared/domain/subscription';
import { SubscriptionRepository } from '@/api/shared/domain/subscription/subscription.repository';
import { getDrizzleClient } from '@/api/shared/lib/db/drizzle';
import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { LanguageEnum } from '@/shared/enums/language.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { DateUtils } from '@/shared/utils/date.util';
import { cleanupDB } from '@/api/shared/test/dbHelper';
import { createActiveUser } from '@/api/shared/test/testDataFactory';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { executeFunctionByName } from './executionFunctionByName.workflow';

describe('executionFunctionByName', () => {
  // 実際のDBクライアントを使用
  const db = getDrizzleClient();
  const subscriptionRepository = SubscriptionRepository({ db });
  
  // テスト用のユーザーID
  let userId: string;
  
  // 現在の日付をモック
  const now = new Date('2025-03-15T00:00:00.000Z');
  vi.spyOn(DateUtils.create, 'now').mockReturnValue(now);
  
  // テスト前の準備
  beforeEach(async () => {
    // テスト用のユーザーを作成
    const user = await createActiveUser(db)({});
    userId = user.id;
    
    // テスト用のサブスクリプションを作成
    await Promise.all([
      // 今月支払い予定のサブスクリプション（円）
      subscriptionRepository.create({
        entity: Subscription.create({
          userId,
          name: 'Netflix',
          price: '1500',
          currency: CurrencyEnum.Jpy,
          cycle: SubscriptionCycleEnum.OneMonth,
          startedAt: new Date('2025-02-15T00:00:00.000Z'),
          cancelledAt: null,
          description: null,
        }),
      }),
      // 今月支払い予定のサブスクリプション（ドル）
      subscriptionRepository.create({
        entity: Subscription.create({
          userId,
          name: 'Spotify',
          price: '9.99',
          currency: CurrencyEnum.Usd,
          cycle: SubscriptionCycleEnum.OneMonth,
          startedAt: new Date('2025-02-20T00:00:00.000Z'),
          cancelledAt: null,
          description: null,
        }),
      }),
      // 来月支払い予定のサブスクリプション
      subscriptionRepository.create({
        entity: Subscription.create({
          userId,
          name: 'Amazon Prime',
          price: '500',
          currency: CurrencyEnum.Jpy,
          cycle: SubscriptionCycleEnum.OneMonth,
          startedAt: new Date('2025-02-25T00:00:00.000Z'),
          cancelledAt: null,
          description: null,
        }),
      }),
      // 期限切れのサブスクリプション
      subscriptionRepository.create({
        entity: Subscription.create({
          userId,
          name: 'Old Service',
          price: '1000',
          currency: CurrencyEnum.Jpy,
          cycle: SubscriptionCycleEnum.OneMonth,
          startedAt: new Date('2024-01-01T00:00:00.000Z'),
          cancelledAt: new Date('2024-12-31T00:00:00.000Z'),
          description: null,
        }),
      }),
    ]);
  });
  
  // テスト後のクリーンアップ
  afterEach(async () => {
    await cleanupDB(db);
  });

  describe('handleGetMonthlyTotal', () => {
    it('日本語で今月の支払い合計を問い合わせた場合、円換算で合計金額を返すこと', async () => {
      // サブスクリプション一覧を取得
      const subscriptions = await subscriptionRepository.findManyByUserId({ userId });
      
      // 関数を実行
      const result = await executeFunctionByName({ subscriptionRepository })({
        userId,
        subscriptions,
        functionCall: {
          name: 'getMonthlyTotal',
          args: { language: LanguageEnum.Japanese },
        },
      });
      
      // 期待される結果: 1500円 + (9.99ドル * 150円) = 約3000円
      expect(result.message).toContain('今月の支払い予定合計: ¥');
      expect(result.message).toContain('2件');
    });

    it('英語で今月の支払い合計を問い合わせた場合、ドル換算で合計金額を返すこと', async () => {
      // サブスクリプション一覧を取得
      const subscriptions = await subscriptionRepository.findManyByUserId({ userId });
      
      // 関数を実行
      const result = await executeFunctionByName({ subscriptionRepository })({
        userId,
        subscriptions,
        functionCall: {
          name: 'getMonthlyTotal',
          args: { language: LanguageEnum.English },
        },
      });
      
      // 期待される結果: 9.99ドル + (1500円 / 150円) = 約20ドル
      expect(result.message).toContain('Total payments due for this month: $');
      expect(result.message).toContain('2 subscriptions');
    });
    
    it('特定の月（来月）の支払い合計を問い合わせた場合、その月の合計金額を返すこと', async () => {
      // サブスクリプション一覧を取得
      const subscriptions = await subscriptionRepository.findManyByUserId({ userId });
      
      // 来月（4月）を指定
      const nextMonth = now.getMonth() + 2; // 現在3月なので+2で4月
      const year = now.getFullYear();
      
      // 関数を実行
      const result = await executeFunctionByName({ subscriptionRepository })({
        userId,
        subscriptions,
        functionCall: {
          name: 'getMonthlyTotal',
          args: { 
            language: LanguageEnum.Japanese,
            year: year,
            month: nextMonth
          },
        },
      });
      
      // 期待される結果: Amazon Primeの500円のみ
      expect(result.message).toContain(`${year}年${nextMonth}月の支払い予定合計: ¥`);
      expect(result.message).toContain('1件');
    });
  });
});
