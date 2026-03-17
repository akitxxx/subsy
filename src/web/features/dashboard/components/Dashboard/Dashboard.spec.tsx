import { render, screen } from '@testing-library/react';

import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';

import { Dashboard } from './Dashboard';
import { useDashboard } from './useDashboard';

vi.mock('./useDashboard');

vi.mock('@/web/features/subscriptions/components/SubscriptionListCard', () => ({
  SubscriptionListCard: () => <div data-testid="subscription-list-card">SubscriptionListCard</div>,
}));

const baseMockValue: ReturnType<typeof useDashboard> = {
  dashboard: {
    data: { totalThisMonth: 0, upcomingSubscriptions: [] },
    isDashboardLoading: false,
    dashboardError: undefined,
    refetchDashboard: vi.fn(),
  },
  subscriptions: {
    data: [],
    isSubscriptionsLoading: false,
    subscriptionsError: undefined,
    refetchSubscriptions: vi.fn(),
  },
  error: null,
  handleCreateSubscription: vi.fn(),
  handleUpdateSubscription: vi.fn(),
  handleDeleteSubscription: vi.fn(),
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.mocked(useDashboard).mockReturnValue(baseMockValue);
  });

  it('ローディング中はスケルトンが表示される', () => {
    vi.mocked(useDashboard).mockReturnValue({
      ...baseMockValue,
      dashboard: {
        ...baseMockValue.dashboard,
        isDashboardLoading: true,
      },
      subscriptions: {
        ...baseMockValue.subscriptions,
        isSubscriptionsLoading: true,
      },
    });

    const { container } = render(<Dashboard />);

    // Skeleton要素が表示されていること（animate-pulseクラスを持つdiv）
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('ダッシュボードエラー時にエラーメッセージが表示される', () => {
    vi.mocked(useDashboard).mockReturnValue({
      ...baseMockValue,
      dashboard: {
        ...baseMockValue.dashboard,
        dashboardError: new Error('API error'),
      },
    });

    render(<Dashboard />);

    const errorMessages = screen.getAllByText('データの取得に失敗しました');
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it('正常表示時に合計金額が表示される', () => {
    vi.mocked(useDashboard).mockReturnValue({
      ...baseMockValue,
      dashboard: {
        ...baseMockValue.dashboard,
        data: { totalThisMonth: 5000, upcomingSubscriptions: [] },
      },
    });

    render(<Dashboard />);

    expect(screen.getByText('¥5,000')).toBeInTheDocument();
  });

  it('次回支払い日が近いサブスクが表示される', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    vi.mocked(useDashboard).mockReturnValue({
      ...baseMockValue,
      dashboard: {
        ...baseMockValue.dashboard,
        data: {
          totalThisMonth: 3000,
          upcomingSubscriptions: [
            {
              id: '1',
              userId: 'user-1',
              name: 'Netflix',
              price: '1500',
              currency: CurrencyEnum.Jpy,
              cycle: SubscriptionCycleEnum.OneMonth,
              startedAt: new Date('2025-01-01'),
              cancelledAt: null,
              expiredAt: tomorrow,
              description: null,
              createdAt: new Date('2025-01-01'),
              updatedAt: new Date('2025-01-01'),
              deletedAt: null,
            },
            {
              id: '2',
              userId: 'user-1',
              name: 'Spotify',
              price: '980',
              currency: CurrencyEnum.Jpy,
              cycle: SubscriptionCycleEnum.OneMonth,
              startedAt: new Date('2025-01-01'),
              cancelledAt: null,
              expiredAt: tomorrow,
              description: null,
              createdAt: new Date('2025-01-01'),
              updatedAt: new Date('2025-01-01'),
              deletedAt: null,
            },
          ],
        },
      },
    });

    render(<Dashboard />);

    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText('Spotify')).toBeInTheDocument();
  });

  it('サブスクリプションエラー時にエラーメッセージが表示される', () => {
    vi.mocked(useDashboard).mockReturnValue({
      ...baseMockValue,
      subscriptions: {
        ...baseMockValue.subscriptions,
        subscriptionsError: new Error('Subscription API error'),
      },
    });

    render(<Dashboard />);

    expect(screen.getByText('サブスクリプションの取得に失敗しました')).toBeInTheDocument();
  });
});
