import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';

type Subscription = {
  id: number;
  name: string;
  amount: number;
  cycle: string;
  nextBillingDate: string;
};

type SubscriptionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscription: Subscription) => void;
  subscription: Subscription | null;
};

export function SubscriptionModal({
  isOpen,
  onClose,
  onSave,
  subscription,
}: SubscriptionModalProps) {
  const [formData, setFormData] = useState<Subscription>({
    id: 0,
    name: '',
    amount: 0,
    cycle: '',
    nextBillingDate: '',
  });

  useEffect(() => {
    if (subscription) {
      setFormData(subscription);
    } else {
      setFormData({
        id: 0,
        name: '',
        amount: 0,
        cycle: '',
        nextBillingDate: '',
      });
    }
  }, [subscription]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {subscription?.id ? 'サブスク編集' : 'サブスク登録'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                サービス名
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                金額
              </Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cycle" className="text-right">
                支払いサイクル
              </Label>
              <Select
                value={formData.cycle}
                onValueChange={(value) =>
                  setFormData({ ...formData, cycle: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="月額">月額</SelectItem>
                  <SelectItem value="年額">年額</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nextBillingDate" className="text-right">
                次回支払い日
              </Label>
              <Input
                id="nextBillingDate"
                type="date"
                value={formData.nextBillingDate}
                onChange={(e) =>
                  setFormData({ ...formData, nextBillingDate: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{subscription?.id ? '更新' : '登録'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
