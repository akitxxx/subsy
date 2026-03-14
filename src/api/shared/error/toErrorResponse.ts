import { match, P } from 'ts-pattern';
import type { ErrorResponse } from '@/shared/types/error';
import { AppError, ValidationError } from './errors';

export const toErrorResponse = (error: Error): ErrorResponse => {
  console.dir(error, { depth: null });

  return match(error)
    .with(P.instanceOf(ValidationError), (e) => ({
      error: {
        type: e.type,
        title: e.title,
        status: e.status,
        detail: e.message,
        details: e.details?.map((d) => ({
          field: d.field,
          reason: d.reason,
          message: d.message,
        })),
      },
    }))
    .with(P.instanceOf(AppError), (e) => ({
      error: {
        type: e.type,
        title: e.title,
        status: e.status,
        detail: e.message,
      },
    }))
    .otherwise(() => ({
      error: {
        type: 'INTERNAL_ERROR' as const,
        title: 'Internal Server Error',
        status: 500 as const,
        detail: error.message,
      },
    }));
};
