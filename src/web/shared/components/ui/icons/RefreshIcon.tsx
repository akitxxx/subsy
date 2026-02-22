import type { IconProps } from './types';

/**
 * 更新/リフレッシュを表すアイコン
 * 現在時刻の設定や更新操作に使用
 */
export function RefreshIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      role="img"
      {...props}
    >
      <path d="M23 12a11 11 0 1 1-5-9" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}
