import type { SubscriptionViewModel } from '@/shared/domain/subscription/subscription.viewModel';
import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { SubscriptionStatusEnum } from '@/shared/enums/subscription/subscriptionStatus.enum';
import { DateUtils } from '@/shared/utils/date.util';
import { PriceUtils } from '@/shared/utils/price.util';
import { SubscriptionUtils } from '@/shared/utils/subscription.util';
import { Button } from '@/web/shared/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/web/shared/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

type Props = {
  subscription: SubscriptionViewModel;
  onOpenDetailModal: (subscription: SubscriptionViewModel) => void;
  onOpenEditModal: (subscription: SubscriptionViewModel) => void;
  onOpenDeleteDialog: (subscription: SubscriptionViewModel) => void;
};

const statusBadgeStyles: Record<SubscriptionStatusEnum, { bg: string; text: string; label: string }> = {
  [SubscriptionStatusEnum.Active]: { bg: 'bg-green-100', text: 'text-green-500', label: '利用中' },
  [SubscriptionStatusEnum.Cancelled]: { bg: 'bg-orange-100', text: 'text-orange-500', label: '解約済み' },
  [SubscriptionStatusEnum.Expired]: { bg: 'bg-gray-100', text: 'text-gray-500', label: '期限切れ' },
};

export const SubscriptionMobileCard = ({ subscription, onOpenDetailModal, onOpenEditModal, onOpenDeleteDialog }: Props) => {
  const currencySymbol = subscription.currency === CurrencyEnum.Usd ? '$' : '¥';
  const badge = statusBadgeStyles[subscription.status];

  return (
    <div
      className="p-4 rounded-lg border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={(e) => {
        const target = e.target;
        const isDropdownClicked = target instanceof HTMLElement && target.closest('[role="menuitem"]');
        if (!isDropdownClicked) {
          onOpenDetailModal(subscription);
        }
      }}
    >
      {/* 上段: サービス名 + ステータスバッジ + アクションメニュー */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium truncate">{subscription.name}</span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${badge.bg} ${badge.text} shrink-0`}>
            {badge.label}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hover:bg-muted focus:outline-none" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">メニューを開く</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onOpenEditModal(subscription);
              }}
            >
              編集
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDeleteDialog(subscription);
              }}
            >
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 中段: 金額 */}
      <div className="text-xl font-bold mb-2">
        {currencySymbol}
        {PriceUtils.display.format(subscription.price, subscription.currency)}
      </div>

      {/* 下段: 支払いサイクル + 次回支払い日 */}
      <div className="flex items-center justify-between text-sm">
        <span>{SubscriptionUtils.display.formatCycle(subscription.cycle)}</span>
        <span className="text-muted-foreground">{DateUtils.format.custom(subscription.nextPaymentAt, 'YYYY/MM/DD')}</span>
      </div>
    </div>
  );
};
