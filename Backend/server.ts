import 'reflect-metadata';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import fastifyRawBody from 'fastify-raw-body';

import { env } from './infrastructure/config/env.js';
import {
  getHttpsCorsOriginSet,
  isAllowedBrowserOrigin,
} from './infrastructure/config/corsOrigins.js';

import { initializeDatabase } from './infrastructure/database/index.js';
import { registerHelmet } from './infrastructure/plugins/fastifyHelmet.js';
import { registerLayeredRateLimit } from './infrastructure/plugins/layeredRateLimit.js';
import { registerErrorHandler } from './infrastructure/plugins/errorHandler.js';
import jwtPlugin from './infrastructure/plugins/fastifyJwt.js';

import {
  createContainer,
  getControllers,
} from './infrastructure/di/container.js';

import { registerUserRoutes, registerAdminRoutes } from './infrastructure/di/routes.js';

import { redisClient } from './infrastructure/cache/RedisClient.js';
import { logger } from './infrastructure/logging/fileLogger.js';

import { createInterviewSocketServer } from './infrastructure/socket/interviewSocket.js';

// ─────────────────────────────────────────────────────────
// Server role type
// ─────────────────────────────────────────────────────────
type ServerRole = 'user' | 'admin';

// ─────────────────────────────────────────────────────────
// Fastify Factory — creates a configured Fastify instance
// with all shared plugins. The JWT plugin is configured
// to extract tokens from the appropriate cookie name
// based on the server role.
// ─────────────────────────────────────────────────────────
async function createServer(role: ServerRole): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: false,
    trustProxy: true,
    bodyLimit: env.BODY_LIMIT_BYTES,
  });

  // ── Raw Body (required for Stripe webhooks) ──
  await fastify.register(fastifyRawBody, {
    field: 'rawBody',
    global: false,
    encoding: false,
    runFirst: true,
  });

  // ── Security Headers ──
  await registerHelmet(fastify);

  // ── Error Handler ──
  registerErrorHandler(fastify);

  // ── CORS ──
  const corsAllowedOrigins = getHttpsCorsOriginSet(fastify.log);

  await fastify.register(cors, {
    origin: (origin, cb) => {
      if (isAllowedBrowserOrigin(origin, corsAllowedOrigins)) {
        cb(null, true);
        return;
      }

      cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
  });

  // ── Cookies ──
  await fastify.register(cookie);

  // ── Rate Limiting ──
  registerLayeredRateLimit(fastify);

  // ── JWT — extract token from the role-specific cookie ──
  const accessTokenCookieName = role === 'admin'
    ? 'adminAccessToken'
    : 'userAccessToken';

  await fastify.register(jwtPlugin, { accessTokenCookieName });

  // ── Multipart Uploads ──
  await fastify.register(multipart, {
    limits: {
      fileSize: env.UPLOAD_MAX_FILE_SIZE_BYTES,
    },
  });

  // ── Request / Response Logging ──
  const serverLabel = role.toUpperCase();

  fastify.addHook('onRequest', async (request) => {
    logger.info({
      type: 'REQUEST',
      server: serverLabel,
      method: request.method,
      url: request.url,
      ip: request.ip,
    });
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const logData = {
      type: 'RESPONSE',
      server: serverLabel,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
    };

    if (reply.statusCode >= 500) {
      logger.error(logData);
    } else if (reply.statusCode >= 400) {
      logger.warn(logData);
    } else {
      logger.info(logData);
    }
  });

  return fastify;
}

// ─────────────────────────────────────────────────────────
// Bootstrap — initialise shared infrastructure once, then
// start both User and Admin servers in a single process.
// ─────────────────────────────────────────────────────────
async function bootstrap() {
  // ── Shared infrastructure (initialised once) ──
  if (!redisClient.isOpen) {
    await redisClient.connect();
    logger.info('Redis connected');
  }

  const db = await initializeDatabase();
  const ioc = createContainer(db);
  const controllers = getControllers(ioc);

  // ── User Server (port 3000) ──
  const userServer = await createServer('user');
  userServer.decorate('db', db);
  await registerUserRoutes(userServer, controllers);
  createInterviewSocketServer(userServer); // Socket.IO only on user server

  // ── Admin Server (port 3001) ──
  const adminServer = await createServer('admin');
  adminServer.decorate('db', db);
  await registerAdminRoutes(adminServer, controllers);

  // ── Graceful Shutdown ──
  const gracefulShutdown = async () => {
    try {
      logger.info('Shutting down servers...');

      await Promise.allSettled([
        userServer.close(),
        adminServer.close(),
      ]);

      if (redisClient.isOpen) {
        await redisClient.disconnect();
      }

      logger.info('All servers shut down successfully');
      process.exit(0);
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);

  // ── Start both servers ──

  await adminServer.listen({
    port: env.ADMIN_PORT,
    host: '0.0.0.0',
  });

  logger.info(`Admin server running on port ${env.ADMIN_PORT}`);


  await userServer.listen({
    port: env.PORT,
    host: '0.0.0.0',
  });

  logger.info(`User server running on port ${env.PORT}`);


}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});