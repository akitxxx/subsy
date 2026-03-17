import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { z } from 'zod';

export const subscriptionInputSchema = z
  .object({
    name: z.string().trim().min(1, 'サービス名を入力してください').max(100, 'サービス名は100文字以内で入力してください'),
    price: z
      .string()
      .min(1, '金額を入力してください')
      .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, { message: '正の数値を入力してください' })
      .refine((val) => Number(val) <= 99999999.99, { message: '金額が上限を超えています' }),
    currency: z.nativeEnum(CurrencyEnum),
    cycle: z.nativeEnum(SubscriptionCycleEnum),
    startedAt: z.coerce.date(),
    cancelledAt: z.coerce.date().nullable(),
    description: z.string().max(500, '説明は500文字以内で入力してください').nullable(),
  })
  .refine(
    (data) => {
      if (!data.cancelledAt) return true;
      return data.cancelledAt >= data.startedAt;
    },
    { path: ['cancelledAt'], message: 'キャンセル日は開始日以降にしてください' },
  );

export type SubscriptionInput = z.infer<typeof subscriptionInputSchema>;
