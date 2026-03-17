import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { subscriptionInputSchema } from './subscription.validation';

const validInput = () => ({
  name: 'Netflix',
  price: '1000',
  currency: CurrencyEnum.Jpy,
  cycle: SubscriptionCycleEnum.OneMonth,
  startedAt: new Date('2025-01-01'),
  cancelledAt: null,
  description: null,
});

describe('subscriptionInputSchema', () => {
  describe('name', () => {
    it('空文字はエラー', () => {
      const result = subscriptionInputSchema.safeParse({ ...validInput(), name: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('サービス名を入力してください');
      }
    });

    it('101文字以上はエラー', () => {
      const result = subscriptionInputSchema.safeParse({ ...validInput(), name: 'a'.repeat(101) });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('サービス名は100文字以内で入力してください');
      }
    });

    it('100文字はOK', () => {
      const result = subscriptionInputSchema.safeParse({ ...validInput(), name: 'a'.repeat(100) });
      expect(result.success).toBe(true);
    });

    it('前後空白はトリムされる', () => {
      const result = subscriptionInputSchema.safeParse({ ...validInput(), name: '  Netflix  ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Netflix');
      }
    });

    it('空白のみはエラー', () => {
      const result = subscriptionInputSchema.safeParse({ ...validInput(), name: '   ' });
      expect(result.success).toBe(false);
    });
  });

  describe('price', () => {
    it('空文字はエラー', () => {
      const result = subscriptionInputSchema.safeParse({ ...validInput(), price: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('金額を入力してください');
      }
    });

    it('0はエラー', () => {
      const result = subscriptionInputSchema.safeParse({ ...validInput(), price: '0' });
      expect(result.success).toBe(false);
    });

    it('負の数はエラー', () => {
      const result = subscriptionInputSchema.safeParse({ ...validInput(), price: '-100' });
      expect(result.success).toBe(false);
    });

    it('数値でない文字列はエラー', () => {
      const result = subscriptionInputSchema.safeParse({ ...validInput(), price: 'abc' });
      expect(result.success).toBe(false);
    });

    it('正常な金額はOK', () => {
      const result = subscriptionInputSchema.safeParse({ ...validInput(), price: '1000' });
      expect(result.success).toBe(true);
    });

    it('小数点を含む金額はOK', () => {
      const result = subscriptionInputSchema.safeParse({ ...validInput(), price: '9.99' });
      expect(result.success).toBe(true);
    });

    it('上限超過はエラー', () => {
      const result = subscriptionInputSchema.safeParse({ ...validInput(), price: '100000000' });
      expect(result.success).toBe(false);
    });

    it('上限ギリギリはOK', () => {
      const result = subscriptionInputSchema.safeParse({ ...validInput(), price: '99999999.99' });
      expect(result.success).toBe(true);
    });
  });

  describe('cancelledAt', () => {
    it('startedAtより前はエラー', () => {
      const result = subscriptionInputSchema.safeParse({
        ...validInput(),
        startedAt: new Date('2025-06-01'),
        cancelledAt: new Date('2025-01-01'),
      });
      expect(result.success).toBe(false);
    });

    it('startedAt以降はOK', () => {
      const result = subscriptionInputSchema.safeParse({
        ...validInput(),
        startedAt: new Date('2025-01-01'),
        cancelledAt: new Date('2025-06-01'),
      });
      expect(result.success).toBe(true);
    });

    it('startedAtと同日はOK', () => {
      const sameDate = new Date('2025-01-01');
      const result = subscriptionInputSchema.safeParse({
        ...validInput(),
        startedAt: sameDate,
        cancelledAt: sameDate,
      });
      expect(result.success).toBe(true);
    });

    it('nullはOK', () => {
      const result = subscriptionInputSchema.safeParse({ ...validInput(), cancelledAt: null });
      expect(result.success).toBe(true);
    });
  });

  describe('description', () => {
    it('501文字以上はエラー', () => {
      const result = subscriptionInputSchema.safeParse({ ...validInput(), description: 'a'.repeat(501) });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('説明は500文字以内で入力してください');
      }
    });

    it('500文字はOK', () => {
      const result = subscriptionInputSchema.safeParse({ ...validInput(), description: 'a'.repeat(500) });
      expect(result.success).toBe(true);
    });

    it('nullはOK', () => {
      const result = subscriptionInputSchema.safeParse({ ...validInput(), description: null });
      expect(result.success).toBe(true);
    });
  });
});
