import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env } from './infrastructure/config/env.js';
import { initializeDatabase } from './infrastructure/database/index.js';
import { registerHelmet } from './infrastructure/plugins/fastifyHelmet.js';
import { registerErrorHandler } from './infrastructure/plugins/errorHandler.js';
import jwtPlugin from './infrastructure/plugins/fastifyJwt.js';
import { createContainer } from './infrastructure/di/container.js';
import { registerRoutes } from './infrastructure/di/routes.js';
import { redisClient } from './infrastructure/cache/RedisClient.js';

async function bootstrap() {
    // Reduced logging in development for better performance
    const fastify = Fastify({
        logger: process.env.NODE_ENV === 'production'
            ? true
            : { level: 'error' }
    });

    await registerHelmet(fastify);
    registerErrorHandler(fastify);

    await fastify.register(cors, {
        origin: [env.FRONTEND_URL || 'http://localhost:5173'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
    });

     if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log(" Redis connected");
  }

    const db = await initializeDatabase();
    fastify.decorate('db', db);

    await fastify.register(jwtPlugin);

    const container = createContainer(fastify, db);

    await registerRoutes(fastify, container.controllers);

    // Graceful shutdown
    const gracefulShutdown = async () => {
        console.log('🛑 Shutting down gracefully...');
        await redisClient.disconnect();
        await fastify.close();
        process.exit(0);
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

    try {
        await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
        console.log(`🚀 Server running on port ${env.PORT}`);
    } catch (err) {
        fastify.log.error(err);
        await redisClient.disconnect();
        process.exit(1);
    }
}

bootstrap();

