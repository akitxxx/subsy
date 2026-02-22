import type { SubscriptionViewModel } from '@/shared/domain/subscription/subscription.viewModel';
import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { DateUtils } from '@/shared/utils/date.util';
import { PriceUtils } from '@/shared/utils/price.util';
import { SubscriptionUtils } from '@/shared/utils/subscription.util';
import { CancelButton, PrimaryButton } from '@/web/shared/components/button';
import { Card, CardContent } from '@/web/shared/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/web/shared/components/ui/dialog';
import { AlertCircleIcon, CalendarIcon, CheckIcon, ClockIcon, CreditCardIcon, InfoIcon, PencilIcon, TagIcon, XIcon } from 'lucide-react';
import { useMemo } from 'react';

type SubscriptionDetailModalProps = {
  subscription: SubscriptionViewModel | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
};

export const SubscriptionDetailModal = ({ subscription, isOpen, onClose, onEdit }: SubscriptionDetailModalProps) => {
  // subscription がnullの場合は何も表示しない
  if (!subscription) return null;

  // サブスクリプションのステータス情報を生成
  const statusInfo = useMemo(() => {
    if (subscription.isExpired) {
      return {
        label: '期限切れ',
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        icon: <AlertCircleIcon className="h-4 w-4" />,
      };
    }
    if (subscription.isCancelled) {
      return {
        label: 'キャンセル済み',
        color: 'text-orange-500',
        bgColor: 'bg-orange-100',
        icon: <XIcon className="h-4 w-4" />,
      };
    }
    return {
      label: '利用中',
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      icon: <CheckIcon className="h-4 w-4" />,
    };
  }, [subscription]);

  // 通貨記号を決定
  const currencySymbol = subscription.currency === CurrencyEnum.Usd ? '$' : '¥';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md transition-all duration-200 ease-in-out">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <TagIcon className="h-5 w-5 mr-2 text-primary" />
            サブスクリプション詳細
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* ヘッダー部分 */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">{subscription.name}</h3>
            <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.color}`}>
              {statusInfo.icon}
              <span className="ml-1">{statusInfo.label}</span>
            </div>
          </div>

          {/* 金額と支払いサイクル */}
          <Card className="mb-4 border-none shadow-sm transition-all duration-200 hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center text-muted-foreground">
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  <span>お支払い情報</span>
                </div>
              </div>
              <div className="flex justify-between items-baseline">
                <div className="text-2xl font-bold">
                  {currencySymbol}
                  {PriceUtils.display.format(subscription.price, subscription.currency)}
                </div>
                <div className="text-sm text-muted-foreground">{SubscriptionUtils.display.formatCycle(subscription.cycle)}</div>
              </div>
            </CardContent>
          </Card>

          {/* 日付情報 */}
          <Card className="mb-4 border-none shadow-sm transition-all duration-200 hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center text-muted-foreground mb-3">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>日付情報</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">開始日</span>
                  <span className="text-sm font-medium">{DateUtils.format.custom(subscription.startedAt, 'YYYY/MM/DD')}</span>
                </div>

                {!subscription.isCancelled && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">次回支払い日</span>
                    <span className="text-sm font-medium">{DateUtils.format.custom(subscription.nextPaymentAt, 'YYYY/MM/DD')}</span>
                  </div>
                )}

                {subscription.cancelledAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">キャンセル日</span>
                    <span className="text-sm font-medium">{DateUtils.format.custom(subscription.cancelledAt, 'YYYY/MM/DD')}</span>
                  </div>
                )}

                {subscription.expiredAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">有効期限</span>
                    <span className="text-sm font-medium">{DateUtils.format.custom(subscription.expiredAt, 'YYYY/MM/DD')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* メモ */}
          {subscription.description && (
            <Card className="mb-4 border-none shadow-sm transition-all duration-200 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center text-muted-foreground mb-2">
                  <InfoIcon className="h-4 w-4 mr-2" />
                  <span>メモ</span>
                </div>
                <div className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-md">{subscription.description}</div>
              </CardContent>
            </Card>
          )}

          {/* ボタン */}
          <div className="flex justify-end space-x-2 pt-2">
            <PrimaryButton onClick={onEdit} className="gap-1">
              <PencilIcon className="h-4 w-4" />
              編集
            </PrimaryButton>
            <CancelButton onClick={onClose}>閉じる</CancelButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
