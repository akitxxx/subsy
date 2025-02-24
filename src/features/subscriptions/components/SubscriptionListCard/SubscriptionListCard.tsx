import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { SubscriptionCreateModel, SubscriptionViewModel } from '@/domain/subscription/subscription.viewModel';
import { DeleteConfirmDialog } from '@/features/subscriptions/components/DeleteConfirmDialog';
import { SubscriptionModal } from '@/features/subscriptions/components/SubscriptionModal';
import { DateUtils } from '@/lib/date.util';
import { formatCycle } from '@/lib/subscription.util';
import { MoreHorizontal } from 'lucide-react';
import { useSubscriptionList } from './useSubscriptionList';

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
    handleOpenModal,
    handleCloseModal,
    handleCreateSubscription,
    handleUpdateSubscription,
    handleDeleteSubscription,
    setIsDeleteDialogOpen,
    setCurrentSubscription,
  } = useSubscriptionList({ subscriptions, onCreate, onUpdate, onDelete });

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>サブスクリプション</CardTitle>
        <Button onClick={() => handleOpenModal()} className="font-bold">
          追加
        </Button>
      </CardHeader>
      <CardContent>
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
            {subscriptions.length > 0 ? (
              subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.name}</TableCell>
                  <TableCell>¥{Number(sub.price).toLocaleString()}</TableCell>
                  <TableCell>{formatCycle(sub.cycle)}</TableCell>
                  <TableCell>{DateUtils.format.custom(sub.nextPaymentAt, 'YYYY/MM/DD')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-muted focus:outline-none">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                          <span className="sr-only">メニューを開く</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenModal(sub)}>編集</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setCurrentSubscription(sub);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  サブスクリプションはありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <SubscriptionModal
        isOpen={isModalOpen}
        isEdit={isEditModal}
        onClose={handleCloseModal}
        onCreate={handleCreateSubscription}
        onUpdate={handleUpdateSubscription}
        subscription={currentSubscription}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => currentSubscription && handleDeleteSubscription(currentSubscription)}
        subscriptionName={currentSubscription?.name}
      />
    </Card>
  );
};
