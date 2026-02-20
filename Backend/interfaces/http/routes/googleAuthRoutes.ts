import { FastifyInstance } from 'fastify';
import { GoogleAuthController } from '../controllers/GoogleAuthController.js';

export async function googleAuthRoutes(
    fastify: FastifyInstance,
    controller: GoogleAuthController
) {
    fastify.get('/google', {
        handler: controller.initiateAuth,
    });

    fastify.get('/google/callback', {
        handler: controller.handleCallback,
    });

    fastify.get('/google/exchange', {
        handler: controller.exchangeToken,
    });
}
