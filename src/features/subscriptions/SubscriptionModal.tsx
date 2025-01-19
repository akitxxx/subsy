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
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[500px] mx-auto rounded-lg">
        <DialogHeader className="px-4 sm:px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold">
            {subscription?.id ? 'サブスク編集' : 'サブスク登録'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="px-4 sm:px-6 space-y-5">
            <div className="grid gap-2 sm:grid-cols-8 sm:items-center sm:gap-4">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700 sm:text-right sm:whitespace-nowrap sm:col-span-3"
              >
                サービス名
              </Label>
              <div className="sm:col-span-5">
                <Input
                  id="name"
                  placeholder="Netflix"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-8 sm:items-center sm:gap-4">
              <Label
                htmlFor="amount"
                className="text-sm font-medium text-gray-700 sm:text-right sm:whitespace-nowrap sm:col-span-3"
              >
                金額
              </Label>
              <div className="relative sm:col-span-5">
                <Input
                  id="amount"
                  type="number"
                  placeholder="1000"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: Number(e.target.value) })
                  }
                  className="w-full pl-7"
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
                  ¥
                </span>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-8 sm:items-center sm:gap-4">
              <Label
                htmlFor="cycle"
                className="text-sm font-medium text-gray-700 sm:text-right sm:whitespace-nowrap sm:col-span-3"
              >
                支払いサイクル
              </Label>
              <div className="sm:col-span-5">
                <Select
                  value={formData.cycle}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cycle: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="月額">月額</SelectItem>
                    <SelectItem value="年額">年額</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-8 sm:items-center sm:gap-4">
              <Label
                htmlFor="nextBillingDate"
                className="text-sm font-medium text-gray-700 sm:text-right sm:whitespace-nowrap sm:col-span-3"
              >
                次回支払い日
              </Label>
              <div className="sm:col-span-5">
                <Input
                  id="nextBillingDate"
                  type="date"
                  value={formData.nextBillingDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nextBillingDate: e.target.value,
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="px-4 sm:px-6 py-6 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none"
            >
              キャンセル
            </Button>
            <Button type="submit" className="flex-1 sm:flex-none font-semibold">
              {subscription?.id ? '更新' : '登録'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
