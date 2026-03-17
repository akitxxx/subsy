import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import type { SubscriptionViewModel } from '@/shared/domain/subscription/subscription.viewModel';
import { CurrencyEnum } from '@/shared/enums/currency.enum';
import { SubscriptionCycleEnum } from '@/shared/enums/subscription/subscriptionCycle.enum';
import { SubscriptionStatusEnum } from '@/shared/enums/subscription/subscriptionStatus.enum';

import { SubscriptionListCard } from './SubscriptionListCard';
import { useSubscriptionListCard } from './useSubscriptionListCard';

vi.mock('./useSubscriptionListCard');

vi.mock('@/web/features/subscriptions/components/SubscriptionModal', () => ({
  SubscriptionModal: () => <div data-testid="subscription-modal" />,
}));

vi.mock('../SubscriptionDetailModal', () => ({
  SubscriptionDetailModal: () => <div data-testid="subscription-detail-modal" />,
}));

vi.mock('@/web/features/subscriptions/components/DeleteConfirmDialog', () => ({
  DeleteConfirmDialog: () => <div data-testid="delete-confirm-dialog" />,
}));

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

// DropdownMenu UI コンポーネントをモック
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
  Plus: () => <span>+</span>,
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
  expiredAt: new Date('2025-02-01'),
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

const mockHandleOpenModal = vi.fn();
const mockHandleOpenDetailModal = vi.fn();

const baseMockHook: ReturnType<typeof useSubscriptionListCard> = {
  isModalOpen: false,
  isEditModal: false,
  currentSubscription: null,
  isDeleteDialogOpen: false,
  isDetailModalOpen: false,
  detailSubscription: null,
  isTransitioning: false,
  isLoading: false,
  handleOpenModal: mockHandleOpenModal,
  handleCloseModal: vi.fn(),
  handleOpenDetailModal: mockHandleOpenDetailModal,
  handleCloseDetailModal: vi.fn(),
  handleSwitchToEditModal: vi.fn(),
  setIsDeleteDialogOpen: vi.fn(),
  setCurrentSubscription: vi.fn(),
  handleCreateSubscription: vi.fn(),
  handleUpdateSubscription: vi.fn(),
  handleDeleteSubscription: vi.fn(),
};

const defaultProps = {
  subscriptions: [] as SubscriptionViewModel[],
  onCreate: vi.fn(),
  onUpdate: vi.fn(),
  onDelete: vi.fn(),
};

describe('SubscriptionListCard', () => {
  beforeEach(() => {
    vi.mocked(useSubscriptionListCard).mockReturnValue(baseMockHook);
  });

  it('サブスクリプション一覧がテーブルに表示される', () => {
    const subscriptions = [
      createSubscription({ id: '1', name: 'Netflix', price: '1500' }),
      createSubscription({ id: '2', name: 'Spotify', price: '980' }),
    ];

    render(<SubscriptionListCard {...defaultProps} subscriptions={subscriptions} />);

    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText('Spotify')).toBeInTheDocument();
  });

  it('サブスクリプションがない場合に空メッセージが表示される', () => {
    render(<SubscriptionListCard {...defaultProps} subscriptions={[]} />);

    expect(screen.getByText('サブスクリプションはありません')).toBeInTheDocument();
  });

  it('追加ボタンクリックで handleOpenModal が呼ばれる', async () => {
    const user = userEvent.setup();
    render(<SubscriptionListCard {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: /追加/ });
    await user.click(addButton);

    expect(mockHandleOpenModal).toHaveBeenCalled();
  });

  it('テーブル行クリックで handleOpenDetailModal が呼ばれる', async () => {
    const user = userEvent.setup();
    const subscription = createSubscription();

    render(<SubscriptionListCard {...defaultProps} subscriptions={[subscription]} />);

    await user.click(screen.getByText('Netflix'));

    expect(mockHandleOpenDetailModal).toHaveBeenCalledWith(subscription);
  });
});
