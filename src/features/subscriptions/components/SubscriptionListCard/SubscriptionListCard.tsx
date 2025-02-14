import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeleteConfirmDialog } from '@/features/subscriptions/components/DeleteConfirmDialog';
import { SubscriptionModal } from '@/features/subscriptions/components/SubscriptionModal';
import type { Subscription } from '@/types/domains/subscription';
import { useSubscriptionList } from './useSubscriptionList';

type Props = {
  subscriptions: Subscription[];
  onCreate: (subscription: Subscription) => void;
  onUpdate: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
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
        <Button onClick={() => handleOpenModal({ isEdit: false })} className="font-bold">
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
            {subscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.name}</TableCell>
                <TableCell>¥{Number(sub.price).toLocaleString()}</TableCell>
                <TableCell>{sub.cycle}</TableCell>
                <TableCell>{sub.expiredAt}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpenModal({ isEdit: true, subscription: sub })} variant="outline" size="sm" className="mr-2">
                    編集
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setCurrentSubscription(sub);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    削除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <SubscriptionModal
        isOpen={isModalOpen}
        isEdit={isEditModal}
        onClose={handleCloseModal}
        onCreate={onCreate}
        onUpdate={handleUpdateSubscription}
        subscription={currentSubscription}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => currentSubscription && handleDeleteSubscription(currentSubscription.id)}
        subscriptionName={currentSubscription?.name}
      />
    </Card>
  );
};
