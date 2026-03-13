import type { ErrorType, StatusCode } from '@/shared/types/error';

// 基底エラークラス
class AppError extends Error {
  constructor(
    public readonly type: ErrorType,
    public readonly title: string,
    public readonly status: StatusCode,
    message: string,
    public readonly details?: Array<{
      field: string;
      reason: string;
      message: string;
    }>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// 具体的なエラークラス
export class NotFoundError extends AppError {
  readonly _tag = 'NotFoundError' as const;
  constructor(message = 'Resource not found') {
    super('NOT_FOUND', 'Resource Not Found', 404, message);
  }
}

export class ValidationError extends AppError {
  readonly _tag = 'ValidationError' as const;
  constructor(message: string, details: Array<{ field: string; reason: string; message: string }>) {
    super('INVALID_ARGUMENT', 'Invalid Parameter(s)', 400, message, details);
  }
}

export class UnauthorizedError extends AppError {
  readonly _tag = 'UnauthorizedError' as const;
  constructor(message = 'Authentication required') {
    super('UNAUTHORIZED', 'Authentication Required', 401, message);
  }
}

export class ForbiddenError extends AppError {
  readonly _tag = 'ForbiddenError' as const;
  constructor(message = 'Access denied') {
    super('FORBIDDEN', 'Access Denied', 403, message);
  }
}

export class ConflictError extends AppError {
  readonly _tag = 'ConflictError' as const;
  constructor(message = 'Resource already exists') {
    super('CONFLICT', 'Resource Already Exists', 409, message);
  }
}

export class InternalServerError extends AppError {
  readonly _tag = 'InternalServerError' as const;
  constructor(message = 'Internal server error') {
    super('INTERNAL_ERROR', 'Internal Server Error', 500, message);
  }
}
