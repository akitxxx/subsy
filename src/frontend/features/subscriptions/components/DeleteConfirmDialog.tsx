import { CancelButton, DestructiveButton } from '@/frontend/shared/components/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/frontend/shared/components/ui/dialog';

type DeleteConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subscriptionName: string | undefined;
};

export function DeleteConfirmDialog({ isOpen, onClose, onConfirm, subscriptionName }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>サブスクリプションの削除</DialogTitle>
          <DialogDescription>
            本当に「{subscriptionName}
            」を削除しますか？この操作は取り消せません。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <CancelButton onClick={onClose}>キャンセル</CancelButton>
          <DestructiveButton onClick={onConfirm}>削除</DestructiveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
