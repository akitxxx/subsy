import { cn } from '@/frontend/shared/lib/utils';
import { ActionButton, type ActionButtonProps } from './ActionButton';

/**
 * キャンセルボタン
 * キャンセル・閉じるなどの二次的なアクションに使用
 */
export const CancelButton = (props: Omit<ActionButtonProps, 'variant'>) => {
  return (
    <ActionButton
      {...props}
      variant="outline"
      className={cn('hover:bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700', props.className)}
    />
  );
};
