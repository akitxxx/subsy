import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import type { SubscriptionViewModel } from '@/shared/domain/subscription/subscription.viewModel';
import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { SubscriptionStatusEnum } from '@/shared/enums/subscription/subscriptionStatus.enum';
import { SubscriptionDetailModal } from './SubscriptionDetailModal';

vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children, open }: { children: React.ReactNode; open: boolean }) => (open ? <>{children}</> : null),
  Trigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Overlay: React.forwardRef(({ children }: { children?: React.ReactNode }, _ref: React.Ref<HTMLDivElement>) => <div>{children}</div>),
  Content: React.forwardRef(({ children }: { children?: React.ReactNode }, _ref: React.Ref<HTMLDivElement>) => <div>{children}</div>),
  Title: React.forwardRef(({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>, _ref: React.Ref<HTMLHeadingElement>) => (
    <h2 {...props}>{children}</h2>
  )),
  Description: React.forwardRef(
    ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>, _ref: React.Ref<HTMLParagraphElement>) => (
      <p {...props}>{children}</p>
    ),
  ),
  Close: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/shared/utils/date.util', () => ({
  DateUtils: {
    format: {
      custom: (_date: Date, _format: string) => '2025/01/01',
    },
  },
}));

vi.mock('@/shared/utils/price.util', () => ({
  PriceUtils: {
    display: { format: (price: string) => price },
  },
}));

vi.mock('@/shared/utils/subscription.util', () => ({
  SubscriptionUtils: {
    display: { formatCycle: () => '1ヶ月' },
  },
}));

const createSubscription = (overrides?: Partial<SubscriptionViewModel>): SubscriptionViewModel => ({
  id: 'sub-1',
  userId: 'user-1',
  name: 'Netflix',
  price: '1490',
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

describe('SubscriptionDetailModal', () => {
  const defaultProps = {
    subscription: createSubscription(),
    isOpen: true,
    onClose: vi.fn(),
    onEdit: vi.fn(),
  };

  it('サブスクリプション情報が表示される', () => {
    render(<SubscriptionDetailModal {...defaultProps} />);

    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText(/1490/)).toBeInTheDocument();
    // DateUtils.format.customのモックにより日付は'2025/01/01'で表示される
    expect(screen.getAllByText('2025/01/01').length).toBeGreaterThanOrEqual(1);
  });

  it('利用中のステータスバッジが表示される', () => {
    render(<SubscriptionDetailModal {...defaultProps} subscription={createSubscription({ isInUse: true, isCancelled: false, isExpired: false })} />);

    expect(screen.getByText('利用中')).toBeInTheDocument();
  });

  it('キャンセル済みのステータスバッジが表示される', () => {
    render(
      <SubscriptionDetailModal
        {...defaultProps}
        subscription={createSubscription({
          isCancelled: true,
          isExpired: false,
          cancelledAt: new Date('2025-03-01'),
        })}
      />,
    );

    expect(screen.getByText('キャンセル済み')).toBeInTheDocument();
  });

  it('期限切れのステータスバッジが表示される', () => {
    render(
      <SubscriptionDetailModal
        {...defaultProps}
        subscription={createSubscription({
          isExpired: true,
          expiredAt: new Date('2025-03-01'),
        })}
      />,
    );

    expect(screen.getByText('期限切れ')).toBeInTheDocument();
  });

  it('編集ボタンクリックでonEditが呼ばれる', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();

    render(<SubscriptionDetailModal {...defaultProps} onEdit={onEdit} />);

    await user.click(screen.getByText('編集'));

    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('subscriptionがnullの場合は何も表示されない', () => {
    const { container } = render(<SubscriptionDetailModal {...defaultProps} subscription={null} />);

    expect(container.innerHTML).toBe('');
  });
});
