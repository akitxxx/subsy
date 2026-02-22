import { CancelButton, DestructiveLoadingButton } from '@/web/shared/components/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/web/shared/components/ui/dialog';

type DeleteConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subscriptionName: string | undefined;
  isLoading?: boolean;
};

export function DeleteConfirmDialog({ isOpen, onClose, onConfirm, subscriptionName, isLoading = false }: DeleteConfirmDialogProps) {
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
          <CancelButton onClick={onClose} disabled={isLoading}>
            キャンセル
          </CancelButton>
          <DestructiveLoadingButton onClick={onConfirm} isLoading={isLoading} loadingText="削除中...">
            削除
          </DestructiveLoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
