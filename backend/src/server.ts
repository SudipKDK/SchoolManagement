import type { Server } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

const server: Server = app.listen(env.PORT, () => {
  console.log(`listening on :${env.PORT} [${env.NODE_ENV}]`);
});

function shutdown(signal: NodeJS.Signals): () => void {
  return () => {
    console.log(`${signal} received, closing server`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
}

process.on('SIGTERM', shutdown('SIGTERM'));
process.on('SIGINT', shutdown('SIGINT'));
process.on('unhandledRejection', (reason: unknown) => {
  console.error('unhandledRejection', reason);
  process.exit(1);
});