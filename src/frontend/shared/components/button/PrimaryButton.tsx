import { cn } from '@/frontend/shared/lib/utils';
import { ActionButton, type ActionButtonProps } from './ActionButton';

/**
 * プライマリアクション用のボタン
 * 登録・更新・保存などの主要なアクションに使用
 */
export const PrimaryButton = (props: Omit<ActionButtonProps, 'variant'>) => {
  return <ActionButton {...props} variant="default" className={cn('font-medium text-white', props.className)} />;
};
