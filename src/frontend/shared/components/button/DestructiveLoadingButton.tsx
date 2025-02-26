import { cn } from '@/frontend/shared/lib/utils';
import { LoadingButton, type LoadingButtonProps, type SpinnerColorType } from './LoadingButton';

/**
 * 破壊的アクション用のローディングボタン
 * 削除・リセットなどの注意が必要なアクションに使用
 *
 * @example
 * <DestructiveLoadingButton
 *   isLoading={isDeleting}
 *   loadingText="削除中..."
 *   onClick={handleDelete}
 * >
 *   削除する
 * </DestructiveLoadingButton>
 */
export const DestructiveLoadingButton = (props: Omit<LoadingButtonProps, 'variant'>) => {
  // ローディング状態に応じてスタイルとスピナー色を選択
  const spinnerColor: SpinnerColorType = props.isLoading ? 'primary' : 'white';
  const textColor = props.isLoading ? '' : 'text-white';

  return <LoadingButton {...props} variant="destructive" spinnerColor={spinnerColor} className={cn('font-medium', textColor, props.className)} />;
};
