import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SubscriptionCreateModel, SubscriptionViewModel } from '@/domain/subscription/subscription.viewModel';
import { CurrencyEnum } from '@/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/enums/subscription/subscriptionCycle.enum';
import { useCallback, useEffect, useMemo, useState } from 'react';

type SubscriptionModalProps = {
  isOpen: boolean;
  isEdit: boolean;
  onClose: () => void;
  onCreate: (subscription: SubscriptionCreateModel) => void;
  onUpdate: (subscription: SubscriptionViewModel) => void;
  subscription: SubscriptionViewModel | null;
};

type TFormData = {
  name: string;
  price: string;
  currency: CurrencyEnum;
  cycle: SubscriptionCycleEnum;
  startedAt: Date;
  cancelledAt: Date | null;
  description: string | null;
};

export function SubscriptionModal({ isOpen, isEdit, onClose, onCreate, onUpdate, subscription }: SubscriptionModalProps) {
  const defaultFormData = useMemo(() => {
    return {
      name: subscription?.name ?? '',
      price: subscription?.price ?? '',
      currency: subscription?.currency ?? CurrencyEnum.JPY,
      cycle: subscription?.cycle ?? SubscriptionCycleEnum.OneMonth,
      startedAt: subscription?.startedAt ?? new Date(),
      cancelledAt: subscription?.cancelledAt ?? null,

      description: subscription?.description ?? null,
    };
  }, [subscription]);

  const [formData, setFormData] = useState<TFormData>(defaultFormData);

  useEffect(() => {
    if (!isOpen) return;
    if (subscription) {
      setFormData(subscription);
      return;
    }
    setFormData(defaultFormData);
  }, [subscription, defaultFormData, isOpen]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      if (!subscription) return;
      onUpdate({ ...subscription, ...formData });
      return;
    }
    onCreate(formData);
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // 表示用の価格フォーマット
  const formatDisplayPrice = (price: string, currency: CurrencyEnum) => {
    if (!price) return '';

    // 数値に変換できない場合は入力値をそのまま返す
    const numericValue = Number(price);
    if (Number.isNaN(numericValue)) return price;

    if (currency === CurrencyEnum.JPY) {
      // 整数部分のみカンマ区切り
      return numericValue.toLocaleString('ja-JP');
    }

    // USDの場合の処理（セントからドルに変換して表示）
    const dollars = Math.floor(numericValue / 100);
    const cents = numericValue % 100;
    const paddedCents = cents.toString().padStart(2, '0');
    return `${dollars.toLocaleString('en-US')}.${paddedCents}`;
  };

  // 入力値から数値のみを抽出
  const parseInputPrice = (input: string, currency: CurrencyEnum) => {
    // カンマを除去
    const unformatted = input.replace(/,/g, '');

    if (currency === CurrencyEnum.JPY) {
      // 整数のみ許可
      return unformatted.replace(/\D/g, '');
    }

    // USDの場合の処理（入力をセントに変換）
    return unformatted.replace(/\D/g, '');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[520px] mx-auto rounded-lg bg-white shadow-lg border-0">
        <DialogHeader className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">{isEdit ? 'サブスク編集' : 'サブスク登録'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(100vh-12rem)]">
          <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-5 sm:space-y-6">
            <div className="grid gap-2 sm:gap-2.5 sm:grid-cols-7 sm:items-center sm:gap-x-4 group">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-500 sm:text-right sm:whitespace-nowrap sm:col-span-2 transition-colors group-focus-within:text-primary-600"
              >
                サービス名
                <span className="text-rose-500 ml-1 text-xs align-top">*</span>
              </Label>
              <div className="sm:col-span-5">
                <Input
                  id="name"
                  placeholder="Netflix"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full transition-all border-gray-200 hover:border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2 sm:gap-2.5 sm:grid-cols-7 sm:items-center sm:gap-x-4 group">
              <Label
                htmlFor="price"
                className="text-sm font-medium text-gray-500 sm:text-right sm:whitespace-nowrap sm:col-span-2 transition-colors group-focus-within:text-primary-600"
              >
                金額
                <span className="text-rose-500 ml-1 text-xs align-top">*</span>
              </Label>
              <div className="flex gap-4 sm:col-span-5">
                <div className="relative flex-1 group/price">
                  <Input
                    id="price"
                    type="text"
                    inputMode="decimal"
                    placeholder={formData.currency === CurrencyEnum.JPY ? '1,000' : '9.99'}
                    value={formatDisplayPrice(formData.price, formData.currency)}
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      if (formData.currency === CurrencyEnum.USD) {
                        // カンマと通貨記号を除去
                        const cleaned = rawValue.replace(/[$,]/g, '');

                        // 空入力の場合
                        if (!cleaned) {
                          setFormData({ ...formData, price: '' });
                          return;
                        }

                        // 数値とドット以外を除去
                        const validInput = cleaned.replace(/[^\d.]/g, '');
                        const parts = validInput.split('.');

                        // ドル部分を処理
                        const dollars = parts[0] ? Number.parseInt(parts[0], 10) : 0;

                        // セント部分を処理
                        let cents = 0;
                        if (parts.length > 1 && parts[1]) {
                          cents = Number.parseInt(`${parts[1]}00`.slice(0, 2), 10);
                        }

                        const totalCents = (dollars * 100 + cents).toString();
                        setFormData({ ...formData, price: totalCents });
                      } else {
                        const parsedValue = parseInputPrice(rawValue, formData.currency);
                        setFormData({ ...formData, price: parsedValue });
                      }
                    }}
                    className="w-full pl-8 transition-all border-gray-200 hover:border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 shadow-sm"
                    required
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium transition-colors group-focus-within/price:text-primary-600">
                    {formData.currency === CurrencyEnum.JPY ? '¥' : '$'}
                  </span>
                </div>
                <Select
                  value={formData.currency}
                  onValueChange={(value: CurrencyEnum) => {
                    const currentPrice = formData.price;
                    let newPrice = currentPrice;

                    if (value === CurrencyEnum.JPY && currentPrice) {
                      // USDからJPYへの変換（セントからの変換）
                      const dollars = Math.floor(Number(currentPrice) / 100);
                      newPrice = dollars.toString();
                    } else if (value === CurrencyEnum.USD && currentPrice) {
                      // JPYからUSDへの変換（セントに変換）
                      newPrice = (Number(currentPrice) * 100).toString();
                    }

                    setFormData({ ...formData, currency: value, price: newPrice });
                  }}
                >
                  <SelectTrigger className="w-28 border-gray-200 hover:border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CurrencyEnum.JPY}>JPY</SelectItem>
                    <SelectItem value={CurrencyEnum.USD}>USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2 sm:gap-2.5 sm:grid-cols-7 sm:items-center sm:gap-x-4 group">
              <Label
                htmlFor="cycle"
                className="text-sm font-medium text-gray-500 sm:text-right sm:whitespace-nowrap sm:col-span-2 transition-colors group-focus-within:text-primary-600"
              >
                支払いサイクル
                <span className="text-rose-500 ml-1 text-xs align-top">*</span>
              </Label>
              <div className="sm:col-span-5">
                <Select value={formData.cycle} onValueChange={(value: SubscriptionCycleEnum) => setFormData({ ...formData, cycle: value })} required>
                  <SelectTrigger className="w-full border-gray-200 hover:border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 shadow-sm">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SubscriptionCycleEnum.OneMonth}>1ヶ月</SelectItem>
                    <SelectItem value={SubscriptionCycleEnum.ThreeMonths}>3ヶ月</SelectItem>
                    <SelectItem value={SubscriptionCycleEnum.SixMonths}>6ヶ月</SelectItem>
                    <SelectItem value={SubscriptionCycleEnum.OneYear}>1年</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2 sm:gap-2.5 sm:grid-cols-7 sm:items-center sm:gap-x-4 group">
              <Label
                htmlFor="startedAt"
                className="text-sm font-medium text-gray-500 sm:text-right sm:whitespace-nowrap sm:col-span-2 transition-colors group-focus-within:text-primary-600"
              >
                開始日
                <span className="text-rose-500 ml-1 text-xs align-top">*</span>
              </Label>
              <div className="sm:col-span-5">
                <Input
                  id="startedAt"
                  type="date"
                  value={formatDateForInput(formData.startedAt)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startedAt: new Date(e.target.value),
                    })
                  }
                  className="w-full border-gray-200 hover:border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 shadow-sm"
                  required
                />
              </div>
            </div>


            <div className="grid gap-2 sm:gap-2.5 sm:grid-cols-7 sm:items-center sm:gap-x-4 group">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-500 sm:text-right sm:whitespace-nowrap sm:col-span-2 pt-2 transition-colors group-focus-within:text-primary-600"
              >
                説明
              </Label>
              <div className="sm:col-span-5">
                <textarea
                  id="description"
                  placeholder="サブスクリプションの説明を入力してください"
                  value={formData.description ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-24 resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition-all hover:border-gray-300 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="px-4 sm:px-6 py-4 border-t border-gray-100 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none min-w-[100px] sm:min-w-[120px] transition-all hover:bg-gray-50 border-gray-200 hover:border-primary-600 text-gray-500 hover:text-primary-600"
            >
              キャンセル
            </Button>
            <Button type="submit" className="flex-1 sm:flex-none min-w-[100px] sm:min-w-[120px] font-medium text-white transition-all">
              {isEdit ? '更新' : '登録'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
