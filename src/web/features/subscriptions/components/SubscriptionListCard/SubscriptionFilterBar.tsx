import { SubscriptionStatusEnum } from '@/shared/enums/subscription/subscriptionStatus.enum';
import { Button } from '@/web/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/web/shared/components/ui/select';
import { ArrowUpDown } from 'lucide-react';
import type { SortField, StatusFilter } from './useSubscriptionFilter';

type Props = {
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  sortField: SortField;
  onSortFieldChange: (value: SortField) => void;
  onToggleSortDirection: () => void;
};

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: SubscriptionStatusEnum.Active, label: '利用中' },
  { value: SubscriptionStatusEnum.Cancelled, label: '解約済み' },
  { value: SubscriptionStatusEnum.Expired, label: '期限切れ' },
];

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'nextPaymentAt', label: '次回支払い日' },
  { value: 'name', label: 'サービス名' },
  { value: 'price', label: '金額' },
];

const isStatusFilter = (value: string): value is StatusFilter => statusOptions.some((option) => option.value === value);

const isSortField = (value: string): value is SortField => sortOptions.some((option) => option.value === value);

export const SubscriptionFilterBar = ({ statusFilter, onStatusFilterChange, sortField, onSortFieldChange, onToggleSortDirection }: Props) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Select value={statusFilter} onValueChange={(v) => isStatusFilter(v) && onStatusFilterChange(v)}>
        <SelectTrigger className="w-[130px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sortField} onValueChange={(v) => isSortField(v) && onSortFieldChange(v)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="icon" onClick={onToggleSortDirection} aria-label="ソート方向を切り替え">
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    </div>
  );
};
