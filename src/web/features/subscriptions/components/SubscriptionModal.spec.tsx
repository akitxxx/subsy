// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Radix Dialog をシンプルにモック
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

// Radix Select をネイティブ select でモック
vi.mock('@radix-ui/react-select', () => ({
  Root: ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange?: (v: string) => void }) => (
    <div data-value={value} data-onvaluechange={onValueChange ? 'true' : undefined}>
      {children}
    </div>
  ),
  Trigger: ({ children }: { children: React.ReactNode }) => <button type="button">{children}</button>,
  Value: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Viewport: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Item: ({ children, value }: { children: React.ReactNode; value: string }) => <div data-value={value}>{children}</div>,
  ItemText: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  ItemIndicator: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Icon: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  ScrollUpButton: () => null,
  ScrollDownButton: () => null,
  Group: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Label: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Separator: () => <hr />,
}));

// lucide-react のアイコンをモック
vi.mock('lucide-react', () => ({
  X: () => <span>X</span>,
  Check: () => <span>Check</span>,
  ChevronDown: () => <span>ChevronDown</span>,
  ChevronUp: () => <span>ChevronUp</span>,
}));

vi.mock('@/shared/utils/date.util', () => ({
  DateUtils: {
    create: { now: () => new Date('2025-01-01T00:00:00Z') },
    format: {
      forDateInput: () => '2025-01-01',
      forTimeInput: () => '00:00',
      forDisplay: () => '2025年1月1日 00:00',
    },
    modify: {
      updateFromDateInput: (_base: Date, value: string) => new Date(value),
      updateFromTimeInput: (_base: Date, _value: string) => new Date('2025-01-01T00:00:00Z'),
    },
  },
}));

vi.mock('@/shared/utils/price.util', () => ({
  PriceUtils: {
    display: { format: (price: string) => price },
    input: {
      handleUsdPriceInput: (val: string) => val,
      parse: (val: string) => val,
      handleCurrencyChange: (price: string) => price,
    },
  },
}));

import { SubscriptionModal } from './SubscriptionModal';

const defaultProps = () => ({
  isOpen: true,
  isEdit: false,
  onClose: vi.fn(),
  onCreate: vi.fn(),
  onUpdate: vi.fn(),
  subscription: null,
});

describe('SubscriptionModal', () => {
  it('空の名前で送信するとエラーが表示される', async () => {
    const props = defaultProps();
    render(<SubscriptionModal {...props} />);

    // 名前フィールドが空のまま送信
    const submitButton = screen.getByRole('button', { name: '登録' });
    await userEvent.click(submitButton);

    // バリデーションエラーが表示され、onCreateは呼ばれない
    expect(props.onCreate).not.toHaveBeenCalled();
  });

  it('不正な金額で送信するとエラーが表示される', async () => {
    const user = userEvent.setup();
    const props = defaultProps();
    render(<SubscriptionModal {...props} />);

    // 名前を入力
    const nameInput = screen.getByLabelText(/サービス名/);
    await user.type(nameInput, 'Netflix');

    // 金額は空のまま送信
    const submitButton = screen.getByRole('button', { name: '登録' });
    await user.click(submitButton);

    // onCreateは呼ばれない
    expect(props.onCreate).not.toHaveBeenCalled();
  });

  it('正常入力で送信するとonCreateが呼ばれる', async () => {
    const user = userEvent.setup();
    const props = defaultProps();
    render(<SubscriptionModal {...props} />);

    // 名前を入力
    const nameInput = screen.getByLabelText(/サービス名/);
    await user.type(nameInput, 'Netflix');

    // 金額を入力
    const priceInput = screen.getByLabelText(/金額/);
    await user.type(priceInput, '1000');

    // 送信
    const submitButton = screen.getByRole('button', { name: '登録' });
    await user.click(submitButton);

    expect(props.onCreate).toHaveBeenCalledTimes(1);
  });
});
