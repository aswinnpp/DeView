import { createStream } from 'rotating-file-stream';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { env } from '../config/env.js';

const LOG_DIR = join(process.cwd(), 'logs');
const RETENTION_DAYS = Math.max(1, parseInt(env.LOG_RETENTION_DAYS ?? '30', 10) || 30);

/**
 * Ensures the logs directory exists and returns a rotating file stream for pino.
 * - Rotates daily (interval: 1d).
 * - Keeps only the last RETENTION_DAYS rotated files (retention period).
 * - Writes to logs/app.log (current), logs/app.0.log, app.1.log, ... for rotated files.
 */
function createRotatingLogStream(): ReturnType<typeof createStream> {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }

  return createStream('app.log', {
    path: LOG_DIR,
    interval: '1d',
    maxFiles: RETENTION_DAYS,
    compress: 'gzip',
  });
}

/**
 * Returns a writable stream for file logging with rotation and retention.
 * Use this when LOG_TO_FILE is enabled or NODE_ENV is production.
 */
export function getFileLogStream(): ReturnType<typeof createStream> {
  return createRotatingLogStream();
}

export const LOG_RETENTION_DAYS_EXPORT = RETENTION_DAYS;
