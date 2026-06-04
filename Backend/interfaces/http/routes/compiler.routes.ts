import type { FastifyInstance } from 'fastify';
import type { CompilerController } from '../controllers/compiler.controller';
import { requireAuth } from '../middleware/authMiddleware.js';
import { executeCodeSchema } from '../schemas/compiler.schema.js';

export async function compilerRoutes(
  fastify: FastifyInstance,
  controller: CompilerController
): Promise<void> {
  fastify.get('/health', {
    handler: controller.healthCheck,
  });

  fastify.get('/languages', {
    handler: controller.getLanguages,
  });

  fastify.post('/execute', {
    schema: executeCodeSchema,
    preHandler: requireAuth,
    handler: controller.executeCode,
  });
}
