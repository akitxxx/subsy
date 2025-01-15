'use client';

import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { SubscriptionModal } from '@/components/subscription-modal';
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
import { useState } from 'react';

type Subscription = {
  id: number;
  name: string;
  amount: number;
  cycle: string;
  nextBillingDate: string;
};

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: 1,
      name: 'Netflix',
      amount: 1490,
      cycle: '月額',
      nextBillingDate: '2023-07-15',
    },
    {
      id: 2,
      name: 'Spotify',
      amount: 980,
      cycle: '月額',
      nextBillingDate: '2023-07-20',
    },
    {
      id: 3,
      name: 'Amazon Prime',
      amount: 4900,
      cycle: '年額',
      nextBillingDate: '2024-01-01',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const totalThisMonth = subscriptions.reduce(
    (total, sub) => total + sub.amount,
    0,
  );
  const upcomingSubscriptions = subscriptions
    .sort(
      (a, b) =>
        new Date(a.nextBillingDate).getTime() -
        new Date(b.nextBillingDate).getTime(),
    )
    .slice(0, 2);

  const handleOpenModal = (subscription?: Subscription) => {
    setCurrentSubscription(
      subscription || {
        id: Date.now(),
        name: '',
        amount: 0,
        cycle: '',
        nextBillingDate: '',
      },
    );
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSubscription(null);
  };

  const handleSaveSubscription = (subscription: Subscription) => {
    if (subscription.id) {
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === subscription.id ? subscription : sub)),
      );
    } else {
      setSubscriptions((prev) => [
        ...prev,
        { ...subscription, id: Date.now() },
      ]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Subsy</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>今月の合計</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              ¥{totalThisMonth.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>次回支払い日が近いサブスク</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {upcomingSubscriptions.map((sub) => (
                <li
                  key={sub.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-secondary"
                >
                  <span className="font-semibold">{sub.name}</span>
                  <span className="font-medium">
                    ¥{sub.amount.toLocaleString()} ({sub.nextBillingDate})
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>サブスク一覧</CardTitle>
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
                <TableHead>操作</TableHead>
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
      </Card>

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
    </div>
  );
}
