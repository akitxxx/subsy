type Subscription = {
  id: number;
  name: string;
  amount: number;
  cycle: string;
  nextBillingDate: string;
};

type Output = {
  subscriptions: Subscription[];
  totalThisMonth: number;
  upcomingSubscriptions: Subscription[];
};

// モックデータ
const mockSubscriptions: Subscription[] = [
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

const run = async (): Promise<Output> => {
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

  return {
    subscriptions: mockSubscriptions,
    totalThisMonth,
    upcomingSubscriptions,
  };
};

export const GetDashboardUsecase = { run };
