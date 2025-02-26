import { cn } from '@/frontend/shared/lib/utils';
import { ActionButton, type ActionButtonProps } from './ActionButton';

/**
 * プライマリアクション用のボタン
 * 登録・更新・保存などの主要なアクションに使用
 *
 * @example
 * <PrimaryButton onClick={handleSubmit}>
 *   保存する
 * </PrimaryButton>
 */
export const PrimaryButton = (props: Omit<ActionButtonProps, 'variant'>) => {
  // プライマリーボタン用のスタイル
  const primaryStyles = 'font-medium text-white';

  return <ActionButton {...props} variant="default" className={cn(primaryStyles, props.className)} />;
};
