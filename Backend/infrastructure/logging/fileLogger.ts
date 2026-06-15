import pino from 'pino';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const LOG_DIR = join(process.cwd(), 'logs');

if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}
console.log('FILE LOGGER LOADED');

const infoStream = createWriteStream(
  join(LOG_DIR, 'info.log'),
  { flags: 'a' }
);



const warnStream = createWriteStream(
  join(LOG_DIR, 'warn.log'),
  { flags: 'a' }
);

const errorStream = createWriteStream(
  join(LOG_DIR, 'error.log'),
  { flags: 'a' }
);

const writeToLevelFile = (chunk: string) => {
  try {
    const log = JSON.parse(chunk);

    console.log('LEVEL:', log.level);

    switch (log.level) {
      case 30:
        console.log('INFO');
        infoStream.write(chunk + '\n');
        break;

      case 40:
        console.log('WARN');
        warnStream.write(chunk + '\n');
        break;

      case 50:
      case 60:
        console.log('ERROR');
        errorStream.write(chunk + '\n');
        break;

      default:
        console.log('DEFAULT', log.level);
        infoStream.write(chunk + '\n');
    }
  } catch (err) {
    console.error('PARSE ERROR', err);
  }
};

const customStream = {
  write(chunk: string) {
    console.log('CUSTOM STREAM HIT');
    writeToLevelFile(chunk.trim());
  },
};

export const logger = pino({}, customStream);