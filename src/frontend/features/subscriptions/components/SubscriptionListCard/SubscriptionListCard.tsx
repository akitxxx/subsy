import { DeleteConfirmDialog } from '@/frontend/features/subscriptions/components/DeleteConfirmDialog';
import { SubscriptionModal } from '@/frontend/features/subscriptions/components/SubscriptionModal';
import { Button } from '@/frontend/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/frontend/shared/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/frontend/shared/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/frontend/shared/components/ui/table';
import type { SubscriptionCreateModel, SubscriptionViewModel } from '@/shared/domain/subscription/subscription.viewModel';
import { DateUtils } from '@/shared/utils/date.util';
import { PriceUtils } from '@/shared/utils/price.util';
import { SubscriptionUtils } from '@/shared/utils/subscription.util';
import { MoreHorizontal, Plus } from 'lucide-react';
import { SubscriptionDetailModal } from '../SubscriptionDetailModal';
import { useSubscriptionListCard } from './useSubscriptionListCard';

type Props = {
  subscriptions: SubscriptionViewModel[];
  onCreate: (subscription: SubscriptionCreateModel) => void;
  onUpdate: (subscription: SubscriptionViewModel) => void;
  onDelete: (subscription: SubscriptionViewModel) => void;
};

export const SubscriptionListCard = ({ subscriptions, onCreate, onUpdate, onDelete }: Props) => {
  const {
    isModalOpen,
    isEditModal,
    currentSubscription,
    isDeleteDialogOpen,
    isDetailModalOpen,
    detailSubscription,
    handleOpenModal,
    handleCloseModal,
    handleCreateSubscription,
    handleUpdateSubscription,
    handleDeleteSubscription,
    handleOpenDetailModal,
    handleCloseDetailModal,
    setIsDeleteDialogOpen,
    setCurrentSubscription,
    handleSwitchToEditModal,
  } = useSubscriptionListCard({ subscriptions, onCreate, onUpdate, onDelete });

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>サブスクリプション</CardTitle>
        <Button onClick={() => handleOpenModal()} className="font-bold" size="sm">
          <Plus className="mr-1 h-4 w-4" />
          追加
        </Button>
      </CardHeader>
      <CardContent>
        {subscriptions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>サービス名</TableHead>
                <TableHead>金額</TableHead>
                <TableHead>支払いサイクル</TableHead>
                <TableHead>次回支払い日</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <SubscriptionTableRow
                  key={subscription.id}
                  subscription={subscription}
                  onOpenDetailModal={handleOpenDetailModal}
                  onOpenEditModal={handleOpenModal}
                  onOpenDeleteDialog={(sub) => {
                    setCurrentSubscription(sub);
                    setIsDeleteDialogOpen(true);
                  }}
                />
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <div className="mb-2">サブスクリプションはありません</div>
          </div>
        )}
      </CardContent>

      {/* 編集用モーダル */}
      <SubscriptionModal
        isOpen={isModalOpen}
        isEdit={isEditModal}
        onClose={handleCloseModal}
        onCreate={handleCreateSubscription}
        onUpdate={handleUpdateSubscription}
        subscription={currentSubscription}
      />

      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => currentSubscription && handleDeleteSubscription(currentSubscription)}
        subscriptionName={currentSubscription?.name}
      />

      {/* サブスク詳細表示用モーダル */}
      <SubscriptionDetailModal
        subscription={detailSubscription}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onEdit={() => {
          if (detailSubscription) {
            handleSwitchToEditModal(detailSubscription);
          }
        }}
      />
    </Card>
  );
};

// テーブル行コンポーネント
type SubscriptionTableRowProps = {
  subscription: SubscriptionViewModel;
  onOpenDetailModal: (subscription: SubscriptionViewModel) => void;
  onOpenEditModal: (subscription: SubscriptionViewModel) => void;
  onOpenDeleteDialog: (subscription: SubscriptionViewModel) => void;
};

const SubscriptionTableRow = ({ subscription, onOpenDetailModal, onOpenEditModal, onOpenDeleteDialog }: SubscriptionTableRowProps) => {
  // 通貨記号を決定
  const currencySymbol = subscription.currency === 'USD' ? '$' : '¥';

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={(e) => {
        const isDropdownClicked = (e.target as HTMLElement).closest('[role="menuitem"]');
        if (!isDropdownClicked) {
          onOpenDetailModal(subscription);
        }
      }}
    >
      <TableCell className="font-medium">{subscription.name}</TableCell>
      <TableCell>
        {currencySymbol}
        {PriceUtils.display.format(subscription.price, subscription.currency)}
      </TableCell>
      <TableCell>{SubscriptionUtils.display.formatCycle(subscription.cycle)}</TableCell>
      <TableCell>{DateUtils.format.custom(subscription.nextPaymentAt, 'YYYY/MM/DD')}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted focus:outline-none" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
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
      </TableCell>
    </TableRow>
  );
};
