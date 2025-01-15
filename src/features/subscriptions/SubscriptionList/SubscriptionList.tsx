import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Subscription } from '@/types/domains/subscription';
import { useSubscriptionList } from './useSubscriptionList';

type Props = {
  subscriptions: Subscription[];
  onSave: (subscription: Subscription) => void;
  onDelete: (id: number) => void;
};

export const SubscriptionList = ({
  subscriptions,
  onSave,
  onDelete,
}: Props) => {
  const {
    isModalOpen,
    currentSubscription,
    isDeleteDialogOpen,
    handleOpenModal,
    handleCloseModal,
    handleSaveSubscription,
    handleDelete,
    setIsDeleteDialogOpen,
    setCurrentSubscription,
  } = useSubscriptionList({ subscriptions, onSave, onDelete });

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle />
        <Button onClick={() => handleOpenModal()}>新規サブスク追加</Button>
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
                <TableCell>¥{sub.amount.toLocaleString()}</TableCell>
                <TableCell>{sub.cycle}</TableCell>
                <TableCell>{sub.nextBillingDate}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleOpenModal(sub)}
                    variant="outline"
                    size="sm"
                    className="mr-2"
                  >
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
        onClose={handleCloseModal}
        onSave={handleSaveSubscription}
        subscription={currentSubscription}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() =>
          currentSubscription && handleDelete(currentSubscription.id)
        }
        subscriptionName={currentSubscription?.name}
      />
    </Card>
  );
};
