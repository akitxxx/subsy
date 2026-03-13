import { Effect, Exit } from 'effect';
import type { Context } from 'hono';
import { toErrorResponse } from '@/api/shared/error';

export const runEffect = async <T>(effect: Effect.Effect<T, Error>, c: Context) => {
  const exit = await Effect.runPromiseExit(effect);
  return Exit.match(exit, {
    onFailure: (cause) => {
      if (cause._tag === 'Fail') {
        const error = cause.error;
        const errorResponse = toErrorResponse(error);
        return c.json(errorResponse, errorResponse.error.status);
      }
      const errorResponse = toErrorResponse(new Error('Internal server error'));
      return c.json(errorResponse, 500);
    },
    onSuccess: (data) => data,
  });
};
