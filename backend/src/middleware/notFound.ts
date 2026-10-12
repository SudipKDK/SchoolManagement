import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';

export const notFound: RequestHandler = (req, _res, next) => {
  next(createHttpError(404, `Route ${req.method} ${req.originalUrl} not found`));
};