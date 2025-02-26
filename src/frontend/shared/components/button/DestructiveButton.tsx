import { cn } from '@/frontend/shared/utils/utils';
import { ActionButton, type ActionButtonProps } from './ActionButton';

/**
 * 破壊的アクション用のボタン
 * 削除・リセットなどの注意が必要なアクションに使用
 */
export const DestructiveButton = (props: Omit<ActionButtonProps, 'variant'>) => {
  return <ActionButton {...props} variant="destructive" className={cn('font-medium', props.className)} />;
};
