import type { HonoEnv } from '@/types/api/hono';
import type { Context } from 'hono';
import type { ErrorResponse } from './error';
import { AppError, InternalServerError } from './error';

export const handleError = (error: unknown, c: Context<HonoEnv>) => {
  if (error instanceof AppError) {
    const response: ErrorResponse = {
      error: {
        message: error.message,
        type: error.type,
        detail: error.detail,
      },
    };
    return c.json(response, error.statusCode);
  }

  console.error(error);
  const internalError = new InternalServerError();
  return c.json(
    {
      error: {
        message: internalError.message,
        type: internalError.type,
      },
    },
    internalError.statusCode,
  );
};
