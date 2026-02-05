import { FastifyInstance } from 'fastify';
import { GoogleAuthController } from '../controllers/GoogleAuthController.js';

export async function googleAuthRoutes(
    fastify: FastifyInstance,
    controller: GoogleAuthController
) {
    // Initiate Google OAuth - redirects to Google
    fastify.get('/google', {
        handler: controller.initiateAuth,
    });

    // Google OAuth callback - handles response from Google
    fastify.get('/google/callback', {
        handler: controller.handleCallback,
    });

    // Token exchange - frontend calls this to get the JWT token
    fastify.get('/google/exchange', {
        handler: controller.exchangeToken,
    });
}
