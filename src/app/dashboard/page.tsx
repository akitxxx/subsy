import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function DashboardPage() {
  // この部分は実際のデータフェッチロジックに置き換える必要があります
  const totalThisMonth = 15000;
  const upcomingSubscriptions = [
    { id: 1, name: 'Netflix', amount: 1490, nextBillingDate: '2023-07-15' },
    { id: 2, name: 'Spotify', amount: 980, nextBillingDate: '2023-07-20' },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ダッシュボード</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>今月の合計</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            ¥{totalThisMonth.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>次回支払い日が近いサブスク</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {upcomingSubscriptions.map((sub) => (
              <li key={sub.id} className="mb-2">
                <span className="font-semibold">{sub.name}</span>: ¥
                {sub.amount.toLocaleString()} ({sub.nextBillingDate})
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <Button asChild>
          <Link href="/subscriptions/new">サブスク追加</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/subscriptions">サブスク一覧</Link>
        </Button>
      </div>
    </div>
  );
}
