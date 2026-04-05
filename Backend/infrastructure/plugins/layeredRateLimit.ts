import type { FastifyInstance, FastifyRequest } from 'fastify';
import { redisClient } from '../cache/RedisClient.js';

const GLOBAL_MAX_PER_MINUTE = 150;

const MUTATING_MAX_PER_MINUTE = 60;

const AUTH_STRICT_MAX_PER_MINUTE = 8;

const WINDOW_SECONDS = 60;

const WEBHOOK_PATH_PREFIX = '/webhooks/';

const AUTH_STRICT_PATHS = new Set(['/auth/login', '/auth/register', '/auth/refresh']);

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

let warnedRedisClosed = false;

function pathOnly(request: FastifyRequest): string {
  const raw = request.url.split('?')[0] ?? '';
  const trimmed = raw.length > 0 ? raw : '/';
  if (trimmed.length > 1 && trimmed.endsWith('/')) {
    return trimmed.slice(0, -1);
  }
  return trimmed;
}

/** Nginx often forwards `/api/...` unchanged; Fastify routes are registered as `/auth/...`. */
function normalizeAppPath(path: string): string {
  if (path === '/api') {
    return '/';
  }
  if (path.startsWith('/api/')) {
    return path.slice(4);
  }
  return path;
}

function rateLimitError(message: string): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = 429;
  return err;
}

async function touchLimit(key: string, windowSec: number): Promise<number> {
  const n = await redisClient.incr(key);
  if (n === 1) {
    await redisClient.expire(key, windowSec);
  }
  return n;
}

function authStrictMessage(normalizedPath: string): string {
  if (normalizedPath === '/auth/login') {
    return 'Too many login attempts. Please try again in a minute.';
  }
  if (normalizedPath === '/auth/register') {
    return 'Too many registration attempts. Please try again in a minute.';
  }
  return 'Too many session refresh attempts. Please try again shortly.';
}

/**
 * Layered limits: global (all methods) + stricter bucket for mutating methods + strict auth routes.
 * Webhook routes skip all limits (Stripe server-to-server).
 */
export function registerLayeredRateLimit(fastify: FastifyInstance): void {
  fastify.log.info(
    {
      redisOpen: redisClient.isOpen,
      globalPerMinute: GLOBAL_MAX_PER_MINUTE,
      mutatingPerMinute: MUTATING_MAX_PER_MINUTE,
      authStrictPerMinute: AUTH_STRICT_MAX_PER_MINUTE,
      windowSeconds: WINDOW_SECONDS,
    },
    'Layered Redis rate limiting registered',
  );

  fastify.addHook('onRequest', async (request) => {
    if (!redisClient.isOpen) {
      if (!warnedRedisClosed) {
        warnedRedisClosed = true;
        request.log.warn(
          'Rate limiting is inactive: Redis is not connected (rl: keys never incremented). Check REDIS_URL and Redis availability.',
        );
      }
      return;
    }

    const rawPath = pathOnly(request);
    const appPath = normalizeAppPath(rawPath);
    if (appPath.startsWith(WEBHOOK_PATH_PREFIX)) {
      return;
    }

    const ip = request.ip;

    const runBucket = async (key: string, max: number, message: string): Promise<void> => {
      try {
        const n = await touchLimit(key, WINDOW_SECONDS);
        if (n > max) {
          throw rateLimitError(message);
        }
      } catch (e) {
        if ((e as { statusCode?: number }).statusCode === 429) {
          throw e;
        }
        request.log.warn({ err: e, key, ip }, 'Rate limit Redis error; allowing request');
      }
    };

    await runBucket(
      `rl:global:${ip}`,
      GLOBAL_MAX_PER_MINUTE,
      'Too many requests. Please try again in a minute.',
    );

    if (MUTATING_METHODS.has(request.method)) {
      await runBucket(
        `rl:mut:${ip}`,
        MUTATING_MAX_PER_MINUTE,
        'Too many write requests. Please try again in a minute.',
      );
    }

    if (AUTH_STRICT_PATHS.has(appPath)) {
      await runBucket(
        `rl:auth:${appPath}:${ip}`,
        AUTH_STRICT_MAX_PER_MINUTE,
        authStrictMessage(appPath),
      );
    }
  });
}
