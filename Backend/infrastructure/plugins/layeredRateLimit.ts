import type { FastifyInstance, FastifyRequest } from 'fastify';
import { redisClient } from '../cache/RedisClient.js';

const GLOBAL_MAX_PER_MINUTE = 150;

const MUTATING_MAX_PER_MINUTE = 60;

const AUTH_STRICT_MAX_PER_MINUTE = 8;

const WINDOW_SECONDS = 60;

const WEBHOOK_PATH_PREFIX = '/webhooks/';

const AUTH_STRICT_PATHS = new Set(['/auth/login', '/auth/register', '/auth/refresh']);

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function pathOnly(request: FastifyRequest): string {
  const raw = request.url.split('?')[0] ?? '';
  return raw.length > 0 ? raw : '/';
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

/** INCR + EXPIRE on first hit. */
async function enforceLimit(
  key: string,
  max: number,
  windowSec: number,
  message: string,
): Promise<void> {
  const n = await redisClient.incr(key);
  if (n === 1) {
    await redisClient.expire(key, windowSec);
  }
  if (n > max) {
    throw rateLimitError(message);
  }
}

async function enforceLimitSafe(
  request: FastifyRequest,
  key: string,
  max: number,
  windowSec: number,
  message: string,
): Promise<void> {
  try {
    await enforceLimit(key, max, windowSec, message);
  } catch (e) {
    if ((e as { statusCode?: number }).statusCode === 429) {
      throw e;
    }
    request.log.warn({ err: e, key }, 'Rate limit Redis error; allowing request');
  }
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
  fastify.addHook('onRequest', async (request) => {
    if (!redisClient.isOpen) {
      return;
    }

    const rawPath = pathOnly(request);
    const appPath = normalizeAppPath(rawPath);
    if (appPath.startsWith(WEBHOOK_PATH_PREFIX)) {
      return;
    }

    const ip = request.ip;

    await enforceLimitSafe(
      request,
      `rl:global:${ip}`,
      GLOBAL_MAX_PER_MINUTE,
      WINDOW_SECONDS,
      'Too many requests. Please try again in a minute.',
    );

    if (MUTATING_METHODS.has(request.method)) {
      await enforceLimitSafe(
        request,
        `rl:mut:${ip}`,
        MUTATING_MAX_PER_MINUTE,
        WINDOW_SECONDS,
        'Too many write requests. Please try again in a minute.',
      );
    }

    if (AUTH_STRICT_PATHS.has(appPath)) {
      await enforceLimitSafe(
        request,
        `rl:auth:${appPath}:${ip}`,
        AUTH_STRICT_MAX_PER_MINUTE,
        WINDOW_SECONDS,
        authStrictMessage(appPath),
      );
    }
  });

  fastify.log.info(
    {
      globalPerMinute: GLOBAL_MAX_PER_MINUTE,
      mutatingPerMinute: MUTATING_MAX_PER_MINUTE,
      authStrictPerMinute: AUTH_STRICT_MAX_PER_MINUTE,
      windowSeconds: WINDOW_SECONDS,
    },
    'Layered Redis rate limiting registered',
  );
}
