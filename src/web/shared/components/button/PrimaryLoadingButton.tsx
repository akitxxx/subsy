import { cn } from '@/web/shared/lib/utils';
import { LoadingButton, type LoadingButtonProps, type SpinnerColorType } from './LoadingButton';

/**
 * プライマリアクション用のローディングボタン
 * 登録・更新・保存などの主要なアクションに使用
 *
 * @example
 * <PrimaryLoadingButton
 *   isLoading={isSubmitting}
 *   loadingText="保存中..."
 *   onClick={handleSubmit}
 * >
 *   保存する
 * </PrimaryLoadingButton>
 */
export const PrimaryLoadingButton = (props: Omit<LoadingButtonProps, 'variant'>) => {
  // ローディング状態に応じてスタイルとスピナー色を選択
  const spinnerColor: SpinnerColorType = props.isLoading ? 'primary' : 'white';
  const textColor = props.isLoading ? '' : 'text-white';

  return <LoadingButton {...props} variant="default" spinnerColor={spinnerColor} className={cn('font-medium', textColor, props.className)} />;
};
