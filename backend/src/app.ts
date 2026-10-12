import path from 'node:path';
import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import routes from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { httpLogger } from './config/logger/httpLogger.js';
import { env } from './config/env.js';
import cookieParser from 'cookie-parser';

export function createApp(): Express {
  const app = express();

  app.set("trust proxy", 1);

  app.use(helmet());

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(compression());

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Parse cookies
  app.use(cookieParser());

  // HTTP request logging
  app.use(httpLogger);

  // Rate limiting
  app.use(
    "/api",
    rateLimit({
      windowMs: 60_000, // 1 minute
      limit: 100, // limit each IP to 100 requests per windowMs
    })
  );

  app.get("/healthz", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/v1", routes);

  // Must be after all routes
  app.use(notFound);

  // Must be the last middleware
  app.use(errorHandler);

  return app;
}