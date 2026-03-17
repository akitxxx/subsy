import { renderHook, act } from '@testing-library/react';
import type { SubscriptionViewModel } from '@/shared/domain/subscription/subscription.viewModel';
import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { SubscriptionStatusEnum } from '@/shared/enums/subscription/subscriptionStatus.enum';
import { useSubscriptionFilter } from './useSubscriptionFilter';

const createSubscription = (overrides: Partial<SubscriptionViewModel> = {}): SubscriptionViewModel => ({
  id: '1',
  userId: 'user-1',
  name: 'Netflix',
  price: '1500',
  currency: CurrencyEnum.Jpy,
  cycle: SubscriptionCycleEnum.OneMonth,
  startedAt: new Date('2025-01-01'),
  cancelledAt: null,
  expiredAt: null,
  description: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  deletedAt: null,
  status: SubscriptionStatusEnum.Active,
  nextPaymentAt: new Date('2025-02-01'),
  isInUse: true,
  isCancelled: false,
  isExpired: false,
  ...overrides,
});

describe('useSubscriptionFilter', () => {
  const subscriptions: SubscriptionViewModel[] = [
    createSubscription({ id: '1', name: 'Netflix', price: '1500', status: SubscriptionStatusEnum.Active, nextPaymentAt: new Date('2025-03-01') }),
    createSubscription({
      id: '2',
      name: 'Amazon',
      price: '500',
      status: SubscriptionStatusEnum.Cancelled,
      nextPaymentAt: new Date('2025-02-01'),
      isCancelled: true,
    }),
    createSubscription({
      id: '3',
      name: 'Spotify',
      price: '980',
      status: SubscriptionStatusEnum.Expired,
      nextPaymentAt: new Date('2025-04-01'),
      isExpired: true,
    }),
  ];

  it('デフォルトで全件返却し、nextPaymentAt昇順でソートされること', () => {
    const { result } = renderHook(() => useSubscriptionFilter(subscriptions));

    expect(result.current.filteredSubscriptions).toHaveLength(3);
    expect(result.current.filteredSubscriptions[0].name).toBe('Amazon');
    expect(result.current.filteredSubscriptions[1].name).toBe('Netflix');
    expect(result.current.filteredSubscriptions[2].name).toBe('Spotify');
    expect(result.current.statusFilter).toBe('all');
    expect(result.current.sortField).toBe('nextPaymentAt');
    expect(result.current.sortDirection).toBe('asc');
  });

  it('statusフィルタでActiveのみ表示できること', () => {
    const { result } = renderHook(() => useSubscriptionFilter(subscriptions));

    act(() => {
      result.current.setStatusFilter(SubscriptionStatusEnum.Active);
    });

    expect(result.current.filteredSubscriptions).toHaveLength(1);
    expect(result.current.filteredSubscriptions[0].name).toBe('Netflix');
  });

  it('statusフィルタでCancelledのみ表示できること', () => {
    const { result } = renderHook(() => useSubscriptionFilter(subscriptions));

    act(() => {
      result.current.setStatusFilter(SubscriptionStatusEnum.Cancelled);
    });

    expect(result.current.filteredSubscriptions).toHaveLength(1);
    expect(result.current.filteredSubscriptions[0].name).toBe('Amazon');
  });

  it('nameソートでアルファベット順にソートされること', () => {
    const { result } = renderHook(() => useSubscriptionFilter(subscriptions));

    act(() => {
      result.current.setSortField('name');
    });

    expect(result.current.filteredSubscriptions[0].name).toBe('Amazon');
    expect(result.current.filteredSubscriptions[1].name).toBe('Netflix');
    expect(result.current.filteredSubscriptions[2].name).toBe('Spotify');
  });

  it('priceソートで数値順にソートされること', () => {
    const { result } = renderHook(() => useSubscriptionFilter(subscriptions));

    act(() => {
      result.current.setSortField('price');
    });

    expect(result.current.filteredSubscriptions[0].name).toBe('Amazon');
    expect(result.current.filteredSubscriptions[1].name).toBe('Spotify');
    expect(result.current.filteredSubscriptions[2].name).toBe('Netflix');
  });

  it('ソート方向をトグルできること', () => {
    const { result } = renderHook(() => useSubscriptionFilter(subscriptions));

    act(() => {
      result.current.toggleSortDirection();
    });

    expect(result.current.sortDirection).toBe('desc');
    // nextPaymentAt降順: Spotify(4月) > Netflix(3月) > Amazon(2月)
    expect(result.current.filteredSubscriptions[0].name).toBe('Spotify');
    expect(result.current.filteredSubscriptions[2].name).toBe('Amazon');
  });

  it('空配列を渡した場合、空配列が返ること', () => {
    const { result } = renderHook(() => useSubscriptionFilter([]));

    expect(result.current.filteredSubscriptions).toHaveLength(0);
  });
});
