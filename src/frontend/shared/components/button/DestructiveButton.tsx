import { cn } from '@/frontend/shared/lib/utils';
import { ActionButton, type ActionButtonProps } from './ActionButton';

/**
 * 破壊的アクション用のボタン
 * 削除・リセットなどの注意が必要なアクションに使用
 *
 * @example
 * <DestructiveButton onClick={handleDelete}>
 *   削除する
 * </DestructiveButton>
 */
export const DestructiveButton = (props: Omit<ActionButtonProps, 'variant'>) => {
  // 破壊的アクション用のスタイル
  const destructiveStyles = 'font-medium text-white';

  return <ActionButton {...props} variant="destructive" className={cn(destructiveStyles, props.className)} />;
};
