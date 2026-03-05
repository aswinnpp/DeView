import { createStream } from 'rotating-file-stream';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { env } from '../config/env.js';

const LOG_DIR = join(process.cwd(), 'logs');
const RETENTION_DAYS = Math.max(1, parseInt(env.LOG_RETENTION_DAYS ?? '30', 10) || 30);


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


export function getFileLogStream(): ReturnType<typeof createStream> {
  return createRotatingLogStream();
}

export const LOG_RETENTION_DAYS_EXPORT = RETENTION_DAYS;
