import { Hono } from 'hono';

// モックデータ
const mockSubscriptions = [
  {
    id: 1,
    name: 'Netflix',
    amount: 1490,
    cycle: '月額',
    nextBillingDate: '2024-04-15',
  },
  {
    id: 2,
    name: 'Spotify',
    amount: 980,
    cycle: '月額',
    nextBillingDate: '2024-04-20',
  },
  {
    id: 3,
    name: 'Amazon Prime',
    amount: 4900,
    cycle: '年額',
    nextBillingDate: '2024-12-01',
  },
];

const dashboard = new Hono();

dashboard.get('/', (c) => {
  try {
    const totalThisMonth = mockSubscriptions.reduce(
      (total, sub) => total + sub.amount,
      0,
    );

    const upcomingSubscriptions = [...mockSubscriptions]
      .sort(
        (a, b) =>
          new Date(a.nextBillingDate).getTime() -
          new Date(b.nextBillingDate).getTime(),
      )
      .slice(0, 2);

    return c.json({
      subscriptions: mockSubscriptions,
      totalThisMonth,
      upcomingSubscriptions,
    });
  } catch (error) {
    return c.json({ error: 'データの取得に失敗しました' }, 500);
  }
});

export default dashboard;
