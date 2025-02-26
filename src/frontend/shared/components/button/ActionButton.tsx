import { Button } from '@/frontend/shared/components/ui/button';
import { cn } from '@/frontend/shared/lib/utils';
import type { ReactNode } from 'react';

/**
 * ボタンの状態を表すEnum
 */
export enum ButtonStateEnum {
  Default = 'default',
  Disabled = 'disabled',
  Loading = 'loading',
}

/**
 * ActionButtonの共通プロパティ
 */
export type ActionButtonProps = {
  /** ボタンクリック時のハンドラー */
  onClick?: () => void;
  /** ボタンの内容 */
  children: ReactNode;
  /** 追加のスタイルクラス */
  className?: string;
  /** ボタンが無効状態かどうか */
  disabled?: boolean;
  /** ボタンがローディング状態かどうか */
  isLoading?: boolean;
  /** ボタンのタイプ */
  type?: 'button' | 'submit' | 'reset';
  /** ボタンの表示バリエーション */
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
};

/**
 * アクションボタンの基本コンポーネント
 * 他のすべてのボタンコンポーネントのベースとして使用
 */
export const ActionButton = ({
  onClick,
  children,
  className,
  disabled = false,
  isLoading = false,
  type = 'button',
  variant = 'default',
  ...props
}: ActionButtonProps) => {
  // ボタンの状態を決定
  const isDisabled = disabled || isLoading;
  const buttonState = isLoading ? ButtonStateEnum.Loading : isDisabled ? ButtonStateEnum.Disabled : ButtonStateEnum.Default;

  // 基本のスタイルクラス
  const baseClasses = 'flex-1 sm:flex-none min-w-[100px] sm:min-w-[120px] transition-all focus:outline-none';

  // 無効/ローディング状態のスタイル - variantに依存しない完全なスタイルセット
  const disabledClasses =
    'bg-gray-300 text-gray-600 hover:bg-gray-300 hover:text-gray-600 cursor-not-allowed ' +
    'disabled:bg-gray-300 disabled:text-gray-600 disabled:opacity-100 focus:outline-none';

  return (
    <Button
      type={type}
      // 無効状態の場合はvariantを適用しない（classNameで上書きするため）
      variant={isDisabled ? undefined : variant}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        // 基本スタイル
        baseClasses,
        // 追加のカスタムスタイル
        className,
        // 無効時のスタイル
        isDisabled && disabledClasses,
      )}
      data-state={buttonState}
      {...props}
    >
      {children}
    </Button>
  );
};
