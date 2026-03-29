import 'reflect-metadata';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import fastifyRawBody from 'fastify-raw-body';

import { env } from './infrastructure/config/env.js';
import { initializeDatabase } from './infrastructure/database/index.js';
import { registerHelmet } from './infrastructure/plugins/fastifyHelmet.js';
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
  });

  await fastify.register(fastifyRawBody, {
    field: 'rawBody',
    global: false,
    encoding: 'utf8',
    runFirst: true,
  });

  await registerHelmet(fastify);
  registerErrorHandler(fastify);

  
  await fastify.register(cors, {
    origin: [
      'http://localhost:5174',
      'https://deview.ddns.net',
      'https://deview.serveftp.com',
      'https://elizebeth-ungreeted-noncapitalistically.ngrok-free.dev',
      env.FRONTEND_URL
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
  });

  
  await fastify.register(cookie);

  if (!redisClient.isOpen) {
    await redisClient.connect();
    fastify.log.info("Redis connected");
  }

  const db = await initializeDatabase();
  fastify.decorate('db', db);

  
  await fastify.register(jwtPlugin);

  await fastify.register(multipart, { limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB max for resume uploads


  const ioc = createContainer(db);
  const controllers = getControllers(ioc);
  await registerRoutes(fastify, controllers);

  createInterviewSocketServer(fastify, env.FRONTEND_URL);

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
