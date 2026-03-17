import { useMemo, useState } from 'react';
import type { SubscriptionViewModel } from '@/shared/domain/subscription/subscription.viewModel';
import type { SubscriptionStatusEnum } from '@/shared/enums/subscription/subscriptionStatus.enum';

export type StatusFilter = 'all' | SubscriptionStatusEnum;
export type SortField = 'name' | 'price' | 'nextPaymentAt';
type SortDirection = 'asc' | 'desc';

export const useSubscriptionFilter = (subscriptions: SubscriptionViewModel[]) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('nextPaymentAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredSubscriptions = useMemo(() => {
    const filtered = statusFilter === 'all' ? subscriptions : subscriptions.filter((s) => s.status === statusFilter);

    return [...filtered].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;

      if (sortField === 'name') {
        return a.name.localeCompare(b.name) * direction;
      }
      if (sortField === 'price') {
        return (Number(a.price) - Number(b.price)) * direction;
      }
      // nextPaymentAt
      return (a.nextPaymentAt.getTime() - b.nextPaymentAt.getTime()) * direction;
    });
  }, [subscriptions, statusFilter, sortField, sortDirection]);

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return {
    filteredSubscriptions,
    statusFilter,
    setStatusFilter,
    sortField,
    setSortField,
    sortDirection,
    toggleSortDirection,
  };
};
