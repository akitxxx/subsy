// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { DeleteConfirmDialog } from './DeleteConfirmDialog';

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

describe('DeleteConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    subscriptionName: 'Netflix',
  };

  it('ダイアログが表示される', () => {
    render(<DeleteConfirmDialog {...defaultProps} />);

    expect(screen.getByText('サブスクリプションの削除')).toBeInTheDocument();
    expect(screen.getByText(/Netflix/)).toBeInTheDocument();
  });

  it('削除ボタンクリックでonConfirmが呼ばれる', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(<DeleteConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: '削除' }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('キャンセルボタンクリックでonCloseが呼ばれる', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<DeleteConfirmDialog {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'キャンセル' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('isOpen=falseで何も表示されない', () => {
    render(<DeleteConfirmDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('サブスクリプションの削除')).not.toBeInTheDocument();
  });
});
