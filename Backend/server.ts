import 'reflect-metadata';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import fastifyRawBody from 'fastify-raw-body';

import { env } from './infrastructure/config/env.js';
import { getHttpsCorsOriginSet, isAllowedBrowserOrigin } from './infrastructure/config/corsOrigins.js';
import { initializeDatabase } from './infrastructure/database/index.js';
import { registerHelmet } from './infrastructure/plugins/fastifyHelmet.js';
import { registerLayeredRateLimit } from './infrastructure/plugins/layeredRateLimit.js';
import { registerErrorHandler } from './infrastructure/plugins/errorHandler.js';
import jwtPlugin from './infrastructure/plugins/fastifyJwt.js';
import { createContainer, getControllers } from './infrastructure/di/container.js';
import { registerRoutes } from './infrastructure/di/routes.js';
import { redisClient } from './infrastructure/cache/RedisClient.js';
import { getFileLogStream } from './infrastructure/logging/fileLogger.js';
import { createInterviewSocketServer } from './infrastructure/socket/interviewSocket.js';

const useFileLogging = env.LOG_TO_FILE === 'true' ;

const loggerConfig = useFileLogging
  ? { level: 'info' as const, stream: getFileLogStream() }
  : {
      level: 'info' as const,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    };

async function bootstrap() {
  const fastify = Fastify({
    logger: loggerConfig,
    trustProxy: true,
    bodyLimit: env.BODY_LIMIT_BYTES,
  });

  await fastify.register(fastifyRawBody, {
    field: 'rawBody',
    global: false,
    encoding: false,
    runFirst: true,
  });

  await registerHelmet(fastify);
  registerErrorHandler(fastify);

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

  
  await fastify.register(cookie);

  if (!redisClient.isOpen) {
    await redisClient.connect();
    fastify.log.info("Redis connected");
  }

  registerLayeredRateLimit(fastify);

  const db = await initializeDatabase();
  fastify.decorate('db', db);

  
  await fastify.register(jwtPlugin);

  await fastify.register(multipart, { limits: { fileSize: env.UPLOAD_MAX_FILE_SIZE_BYTES } });


  const ioc = createContainer(db);
  const controllers = getControllers(ioc);
  await registerRoutes(fastify, controllers);

  createInterviewSocketServer(fastify);

  const gracefulShutdown = async () => {
    await redisClient.disconnect();
    await fastify.close();
    process.exit(0);
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);

  await fastify.listen({ port: env.PORT, host: '0.0.0.0' });

  fastify.log.info(`Server running on port ${env.PORT}`);
}

bootstrap();
