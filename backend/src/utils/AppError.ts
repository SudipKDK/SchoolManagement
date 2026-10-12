import createHttpError, { HttpError } from 'http-errors';

/**
 * AppError wraps http-errors so it works seamlessly with the
 * existing `errorHandler` middleware (which uses `createHttpError.isHttpError`).
 *
 * Usage:
 *   throw new AppError('UNAUTHENTICATED', 'Not authenticated', 401);
 *   throw new AppError('FORBIDDEN', 'Missing permission: read:users', 403);
 */
export class AppError extends Error {
  /** Short machine-readable error code (e.g. "UNAUTHENTICATED"). */
  public readonly code: string;
  /** HTTP status code. */
  public readonly statusCode: number;
  /** The underlying http-errors HttpError instance forwarded to Express. */
  public readonly httpError: HttpError;

  constructor(code: string, message: string, statusCode: number = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;

    // Build an http-errors compatible error so the errorHandler middleware
    // can detect it via `createHttpError.isHttpError(err)`.
    this.httpError = createHttpError(statusCode, message, {
      // `details` is exposed in the JSON response by errorHandler when expose=true
      details: { code },
    });

    // Maintain proper prototype chain for `instanceof` checks.
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
