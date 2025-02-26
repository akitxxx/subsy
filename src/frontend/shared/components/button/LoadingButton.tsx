import { Spinner } from '@/frontend/shared/components/ui/spinner';
import { cn } from '@/frontend/shared/lib/utils';
import type { ReactNode } from 'react';
import { ActionButton, type ActionButtonProps, ButtonStateEnum } from './ActionButton';

/**
 * スピナーの色のタイプ
 */
export type SpinnerColorType = 'white' | 'primary';

/**
 * スピナーのサイズのタイプ
 */
export type SpinnerSizeType = 'sm' | 'md' | 'lg';

/**
 * LoadingButtonのプロパティ
 */
export type LoadingButtonProps = Omit<ActionButtonProps, 'children'> & {
  /** ローディング状態かどうか */
  isLoading: boolean;
  /** ローディング中に表示するテキスト（省略時は通常のchildren） */
  loadingText?: string;
  /** ボタンの内容 */
  children: ReactNode;
  /** スピナーの色 */
  spinnerColor?: SpinnerColorType;
  /** スピナーのサイズ */
  spinnerSize?: SpinnerSizeType;
};

/**
 * ローディング状態を表示できるボタン
 * API呼び出しなどの非同期処理中に使用
 */
export const LoadingButton = ({
  isLoading,
  loadingText,
  children,
  spinnerColor = 'white',
  spinnerSize = 'sm',
  className,
  ...props
}: LoadingButtonProps) => {
  // propsを明示的に分解して処理
  const { disabled, ...restProps } = props;

  return (
    <ActionButton
      {...restProps}
      disabled={disabled}
      isLoading={isLoading}
      className={cn(
        // スピナーを含めたレイアウト調整用クラス
        isLoading && 'flex items-center justify-center',
        className,
      )}
      data-loading={isLoading ? 'true' : 'false'}
    >
      {isLoading ? (
        <>
          <Spinner className="-ml-1 mr-2" color={spinnerColor} size={spinnerSize} />
          <span>{loadingText || children}</span>
        </>
      ) : (
        children
      )}
    </ActionButton>
  );
};
