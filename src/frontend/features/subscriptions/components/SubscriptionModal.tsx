import { CancelButton, PrimaryLoadingButton } from '@/frontend/shared/components/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/frontend/shared/components/ui/dialog';
import { CloseIcon, RefreshIcon } from '@/frontend/shared/components/ui/icons';
import { Input } from '@/frontend/shared/components/ui/input';
import { Label } from '@/frontend/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/frontend/shared/components/ui/select';
import type { SubscriptionCreateModel, SubscriptionViewModel } from '@/shared/domain/subscription/subscription.viewModel';
import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { DateUtils } from '@/shared/utils/date.util';
import { PriceUtils } from '@/shared/utils/price.util';
import { useEffect, useMemo, useState } from 'react';

// 型定義
type SubscriptionModalProps = {
  isOpen: boolean;
  isEdit: boolean;
  onClose: () => void;
  onCreate: (subscription: SubscriptionCreateModel) => void;
  onUpdate: (subscription: SubscriptionViewModel) => void;
  subscription: SubscriptionViewModel | null;
  isLoading?: boolean;
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

// 共通フォームフィールドコンポーネント
type FormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
};

const FormField = ({ id, label, required = false, children }: FormFieldProps) => (
  <div className="grid gap-2 sm:gap-2.5 sm:grid-cols-7 sm:items-center sm:gap-x-4 group">
    <Label
      htmlFor={id}
      className="text-sm font-medium text-gray-500 sm:text-right sm:whitespace-nowrap sm:col-span-2 transition-colors group-focus-within:text-primary-600"
    >
      {label}
      {required && <span className="text-rose-500 ml-1 text-xs align-top">*</span>}
    </Label>
    <div className="sm:col-span-5">{children}</div>
  </div>
);

export function SubscriptionModal({ isOpen, isEdit, onClose, onCreate, onUpdate, subscription, isLoading = false }: SubscriptionModalProps) {
  // 初期フォームデータの生成
  const defaultFormData = useMemo(
    (): TFormData => ({
      name: '',
      price: '',
      currency: CurrencyEnum.Jpy,
      cycle: SubscriptionCycleEnum.OneMonth,
      startedAt: DateUtils.create.now(),
      cancelledAt: null,
      description: null,
    }),
    [],
  );

  const [formData, setFormData] = useState<TFormData>(defaultFormData);

  // モーダルが開かれた時にデータを初期化
  useEffect(() => {
    if (!isOpen) return;
    setFormData(subscription ?? defaultFormData);
  }, [subscription, defaultFormData, isOpen]);

  // フォーム送信ハンドラ
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && subscription) {
      onUpdate({ ...subscription, ...formData });
    } else {
      onCreate({ ...formData });
    }
  };

  // 金額入力ハンドラ
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const newPrice =
      formData.currency === CurrencyEnum.Usd ? PriceUtils.input.handleUsdPriceInput(rawValue) : PriceUtils.input.parse(rawValue, formData.currency);

    setFormData({ ...formData, price: newPrice });
  };

  // 通貨変更ハンドラ
  const handleCurrencyChange = (newCurrency: CurrencyEnum) => {
    const newPrice = PriceUtils.input.handleCurrencyChange(formData.price, newCurrency, formData.currency);

    setFormData({
      ...formData,
      currency: newCurrency,
      price: newPrice,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[520px] mx-auto rounded-lg bg-white shadow-lg border-0">
        <DialogHeader className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">{isEdit ? 'サブスク編集' : 'サブスク登録'}</DialogTitle>
          <DialogDescription style={{ visibility: 'hidden', height: 0, margin: 0 }}>
            {isEdit ? 'サブスクリプション情報を編集してください。' : '新しいサブスクリプションを登録してください。'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(100vh-12rem)]">
          <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-5 sm:space-y-6">
            {/* サービス名フィールド */}
            <FormField id="name" label="サービス名" required>
              <Input
                id="name"
                placeholder="Netflix"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full transition-all border-gray-200 hover:border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 shadow-sm"
                required
              />
            </FormField>

            {/* 金額フィールド */}
            <FormField id="price" label="金額" required>
              <div className="flex gap-4">
                <div className="relative flex-1 group/price">
                  <Input
                    id="price"
                    type="text"
                    inputMode="decimal"
                    placeholder={formData.currency === CurrencyEnum.Jpy ? '1,000' : '9.99'}
                    value={PriceUtils.display.format(formData.price, formData.currency)}
                    onChange={handlePriceChange}
                    className="w-full pl-8 transition-all border-gray-200 hover:border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 shadow-sm"
                    required
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium transition-colors group-focus-within/price:text-primary-600">
                    {formData.currency === CurrencyEnum.Jpy ? '¥' : '$'}
                  </span>
                </div>
                <Select value={formData.currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger className="w-28 border-gray-200 hover:border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CurrencyEnum.Jpy}>JPY</SelectItem>
                    <SelectItem value={CurrencyEnum.Usd}>USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FormField>

            {/* 支払いサイクルフィールド */}
            <FormField id="cycle" label="支払いサイクル" required>
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
            </FormField>

            {/* 開始日時フィールド */}
            <FormField id="startedAt" label="開始日時" required>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-7 sm:col-span-7">
                    <Input
                      id="startedAt"
                      type="date"
                      value={DateUtils.format.forDateInput(formData.startedAt)}
                      onChange={(e) => {
                        const updated = DateUtils.modify.updateFromDateInput(formData.startedAt, e.target.value);
                        setFormData({ ...formData, startedAt: updated });
                      }}
                      className="w-full border-gray-200 hover:border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 shadow-sm"
                      required
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-4">
                    <Input
                      id="startedAtTime"
                      type="time"
                      value={DateUtils.format.forTimeInput(formData.startedAt)}
                      onChange={(e) => {
                        const updated = DateUtils.modify.updateFromTimeInput(formData.startedAt, e.target.value);
                        setFormData({ ...formData, startedAt: updated });
                      }}
                      className="w-full border-gray-200 hover:border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 shadow-sm"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, startedAt: DateUtils.create.now() })}
                      className="inline-flex items-center justify-center h-6 w-6 text-gray-400 hover:text-primary-600 focus:outline-none"
                      title="現在時刻をセット"
                    >
                      <RefreshIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 bg-gray-50 py-1 px-2 rounded border border-gray-100 inline-block">
                  {DateUtils.format.forDisplay(formData.startedAt)}
                </div>
              </div>
            </FormField>

            {/* キャンセル日時フィールド */}
            <FormField id="cancelledAt" label="キャンセル日時">
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-7 sm:col-span-7">
                    <Input
                      id="cancelledAt"
                      type="date"
                      value={formData.cancelledAt ? DateUtils.format.forDateInput(formData.cancelledAt) : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const baseDate = formData.cancelledAt || DateUtils.create.now();
                          const updated = DateUtils.modify.updateFromDateInput(baseDate, e.target.value);
                          setFormData({ ...formData, cancelledAt: updated });
                        } else {
                          setFormData({ ...formData, cancelledAt: null });
                        }
                      }}
                      className="w-full border-gray-200 hover:border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 shadow-sm"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-4">
                    <Input
                      id="cancelledAtTime"
                      type="time"
                      value={formData.cancelledAt ? DateUtils.format.forTimeInput(formData.cancelledAt) : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const baseDate = formData.cancelledAt || DateUtils.create.now();
                          const updated = DateUtils.modify.updateFromTimeInput(baseDate, e.target.value);
                          setFormData({ ...formData, cancelledAt: updated });
                        }
                      }}
                      className="w-full border-gray-200 hover:border-gray-300 focus:border-primary-600 focus:ring-2 focus:ring-primary-100 shadow-sm"
                      disabled={!formData.cancelledAt}
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, cancelledAt: formData.cancelledAt ? null : DateUtils.create.now() })}
                      className="inline-flex items-center justify-center h-6 w-6 text-gray-400 hover:text-primary-600 focus:outline-none"
                      title={formData.cancelledAt ? 'キャンセル日時をクリア' : '現在時刻をセット'}
                    >
                      {formData.cancelledAt ? <CloseIcon className="w-3 h-3" /> : <RefreshIcon className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                {formData.cancelledAt && (
                  <div className="text-xs text-gray-500 bg-gray-50 py-1 px-2 rounded border border-gray-100 inline-block">
                    {DateUtils.format.forDisplay(formData.cancelledAt)}
                  </div>
                )}
              </div>
            </FormField>

            {/* 説明フィールド */}
            <FormField id="description" label="説明">
              <textarea
                id="description"
                placeholder="サブスクリプションの説明を入力してください"
                value={formData.description ?? ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                className="w-full h-24 resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition-all hover:border-gray-300 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </FormField>
          </div>

          <DialogFooter className="px-4 sm:px-6 py-4 border-t border-gray-100 gap-3">
            <CancelButton onClick={onClose} disabled={isLoading}>
              キャンセル
            </CancelButton>
            <PrimaryLoadingButton type="submit" isLoading={isLoading} loadingText={isEdit ? '更新中...' : '登録中...'}>
              {isEdit ? '更新' : '登録'}
            </PrimaryLoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
