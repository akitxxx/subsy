export type ErrorResponse = {
  error: {
    message: string;
    type: string;
    detail?: string;
  };
};

type StatusCode = 400 | 401 | 403 | 404 | 500;

export abstract class AppError extends Error {
  constructor(
    message: string,
    public statusCode: StatusCode,
    public type: string,
    public detail?: string,
  ) {
    super(message);
    this.name = type;
    // Errorのプロトタイプチェーンを正しく設定
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(p: { message: string; detail?: object }) {
    super(p.message, 404, 'NotFound', JSON.stringify(p.detail));
  }
}

export class ValidationError extends AppError {
  constructor(p: { message: string; detail?: object }) {
    super(p.message, 400, 'ValidationError', JSON.stringify(p.detail));
  }
}

export class UnauthorizedError extends AppError {
  constructor(p: { message: string; detail?: object }) {
    super(p.message, 401, 'Unauthorized', JSON.stringify(p.detail));
  }
}

export class ForbiddenError extends AppError {
  constructor(p: { message: string; detail?: object }) {
    super(p.message, 403, 'Forbidden', JSON.stringify(p.detail));
  }
}

export class InternalServerError extends AppError {
  constructor(p: { message?: string; detail?: object } = {}) {
    super(
      p.message ?? 'サーバーエラーが発生しました',
      500,
      'InternalServerError',
      JSON.stringify(p.detail),
    );
  }
}
