// エラーレスポンスの型定義
export interface ErrorDetail {
  field: string;
  reason: string;
  message: string;
}

export interface ErrorResponse {
  error: {
    type: ErrorType;
    title: string;
    status: StatusCode;
    detail: string;
    details?: ErrorDetail[];
  };
}

// エラー種別の定義
export type ErrorType = 'INVALID_ARGUMENT' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'INTERNAL_ERROR';

// ステータスコードの型定義
export type StatusCode = 400 | 401 | 403 | 404 | 409 | 500;
