import type { ErrorRequestHandler } from 'express';
import createHttpError from 'http-errors';
import { AppError } from '../utils/AppError.js';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // Unwrap AppError → use its pre-built HttpError so status/expose/details work.
  const resolved = err instanceof AppError ? err.httpError : err;

  const httpError = createHttpError.isHttpError(resolved)
    ? resolved
    : createHttpError(500, resolved instanceof Error ? resolved : 'Internal Server Error');

  const status = httpError.status;

  // 5xx are logged loudly; 4xx are client mistakes, not incidents
  if (status >= 500) req.log?.error({ err: httpError }, 'request failed');
  else req.log?.warn({ err: httpError }, 'request rejected');

  // Some errors carry required response headers (401 WWW-Authenticate, 405 Allow)
  if (httpError.headers) res.set(httpError.headers);

  res.status(status).json({
    error: {
      message: httpError.expose ? httpError.message : 'Internal Server Error',
      ...(httpError.expose && httpError.details
        ? { details: httpError.details as unknown }
        : {}),
    },
  });
};