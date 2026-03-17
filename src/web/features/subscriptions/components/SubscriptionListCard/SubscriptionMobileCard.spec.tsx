import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import type { SubscriptionViewModel } from '@/shared/domain/subscription/subscription.viewModel';
import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { SubscriptionStatusEnum } from '@/shared/enums/subscription/subscriptionStatus.enum';
import { SubscriptionMobileCard } from './SubscriptionMobileCard';

vi.mock('@/shared/utils/date.util', () => ({
  DateUtils: {
    format: { custom: () => '2025/02/01' },
  },
}));

vi.mock('@/shared/utils/price.util', () => ({
  PriceUtils: {
    display: { format: (price: string) => price },
  },
}));

vi.mock('@/shared/utils/subscription.util', () => ({
  SubscriptionUtils: {
    display: { formatCycle: () => '毎月' },
  },
}));

vi.mock('@/web/shared/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  DropdownMenuContent: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, ...props }: { children: React.ReactNode; onClick?: React.MouseEventHandler }) => (
    <div role="menuitem" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  MoreHorizontal: () => <span>...</span>,
}));

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

describe('SubscriptionMobileCard', () => {
  const defaultProps = {
    onOpenDetailModal: vi.fn(),
    onOpenEditModal: vi.fn(),
    onOpenDeleteDialog: vi.fn(),
  };

  it('サービス名、金額、サイクル、日付が表示されること', () => {
    const subscription = createSubscription();
    render(<SubscriptionMobileCard subscription={subscription} {...defaultProps} />);

    expect(screen.getByText('Netflix')).toBeInTheDocument();
    // 通貨記号と金額は同じ要素内に表示される
    expect(screen.getByText(/¥/)).toBeInTheDocument();
    expect(screen.getByText('毎月')).toBeInTheDocument();
    expect(screen.getByText('2025/02/01')).toBeInTheDocument();
    expect(screen.getByText('利用中')).toBeInTheDocument();
  });

  it('ステータスに応じたバッジが表示されること', () => {
    const cancelledSubscription = createSubscription({ status: SubscriptionStatusEnum.Cancelled, isCancelled: true });
    const { rerender } = render(<SubscriptionMobileCard subscription={cancelledSubscription} {...defaultProps} />);
    expect(screen.getByText('解約済み')).toBeInTheDocument();

    const expiredSubscription = createSubscription({ status: SubscriptionStatusEnum.Expired, isExpired: true });
    rerender(<SubscriptionMobileCard subscription={expiredSubscription} {...defaultProps} />);
    expect(screen.getByText('期限切れ')).toBeInTheDocument();
  });

  it('カードクリックで詳細モーダルコールバックが呼ばれること', async () => {
    const user = userEvent.setup();
    const subscription = createSubscription();
    const onOpenDetailModal = vi.fn();
    render(<SubscriptionMobileCard subscription={subscription} {...defaultProps} onOpenDetailModal={onOpenDetailModal} />);

    await user.click(screen.getByText('Netflix'));
    expect(onOpenDetailModal).toHaveBeenCalledWith(subscription);
  });

  it('編集メニューが動作すること', async () => {
    const user = userEvent.setup();
    const subscription = createSubscription();
    const onOpenEditModal = vi.fn();
    render(<SubscriptionMobileCard subscription={subscription} {...defaultProps} onOpenEditModal={onOpenEditModal} />);

    await user.click(screen.getByText('編集'));
    expect(onOpenEditModal).toHaveBeenCalledWith(subscription);
  });

  it('削除メニューが動作すること', async () => {
    const user = userEvent.setup();
    const subscription = createSubscription();
    const onOpenDeleteDialog = vi.fn();
    render(<SubscriptionMobileCard subscription={subscription} {...defaultProps} onOpenDeleteDialog={onOpenDeleteDialog} />);

    await user.click(screen.getByText('削除'));
    expect(onOpenDeleteDialog).toHaveBeenCalledWith(subscription);
  });
});
