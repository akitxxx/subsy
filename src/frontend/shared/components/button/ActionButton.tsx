import { Button } from '@/frontend/shared/components/ui/button';
import { cn } from '@/frontend/shared/lib/utils';
import type { ReactNode } from 'react';

export type ActionButtonProps = {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
};

/**
 * アクションボタンの基本コンポーネント
 * 他のボタンコンポーネントのベースとして使用
 */
export const ActionButton = ({
  onClick,
  children,
  className,
  disabled = false,
  type = 'button',
  variant = 'default',
  ...props
}: ActionButtonProps) => {
  return (
    <Button
      type={type}
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className={cn('flex-1 sm:flex-none min-w-[100px] sm:min-w-[120px] transition-all', className)}
      {...props}
    >
      {children}
    </Button>
  );
};
