import type { SVGProps } from 'react';

/**
 * アイコンコンポーネントの共通プロパティ
 * @property size - アイコンのサイズ（ピクセル単位）
 */
export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};
