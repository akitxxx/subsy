import type { ErrorResponse, ErrorType, StatusCode } from '@/shared/types/error';

interface ErrorMapping {
  type: ErrorType;
  status: StatusCode;
  title: string;
}

interface ValidationErrorDetail {
  path: string;
  type: string;
  message: string;
}

interface ValidationError extends Error {
  errors: ValidationErrorDetail[];
}

const errorMappings: Record<string, ErrorMapping> = {
  ValidationError: {
    type: 'INVALID_ARGUMENT',
    status: 400,
    title: 'Invalid Parameter(s)',
  },
  UnauthorizedError: {
    type: 'UNAUTHORIZED',
    status: 401,
    title: 'Authentication Required',
  },
  ForbiddenError: {
    type: 'FORBIDDEN',
    status: 403,
    title: 'Access Denied',
  },
  NotFoundError: {
    type: 'NOT_FOUND',
    status: 404,
    title: 'Resource Not Found',
  },
  ConflictError: {
    type: 'CONFLICT',
    status: 409,
    title: 'Resource Already Exists',
  },
};

export const toErrorResponse = (error: Error): ErrorResponse => {
  console.dir(error, { depth: null });
  const mapping = errorMappings[error.constructor.name] || {
    type: 'INTERNAL_ERROR',
    status: 500,
    title: 'Internal Server Error',
  };

  const errorResponse: ErrorResponse = {
    error: {
      type: mapping.type,
      title: mapping.title,
      status: mapping.status,
      detail: error.message,
    },
  };

  // バリデーションエラーの場合、詳細情報を追加
  if (error.constructor.name === 'ValidationError' && 'errors' in error) {
    const validationError = error as ValidationError;
    errorResponse.error.details = validationError.errors.map((e) => ({
      field: e.path,
      reason: e.type,
      message: e.message,
    }));
  }

  return errorResponse;
};
