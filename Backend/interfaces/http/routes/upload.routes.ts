import { FastifyInstance } from 'fastify';
import { UploadController } from '../controllers/upload.controller.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { generateSignatureSchema } from '../schemas/upload.schema.js';

export async function uploadRoutes(
    fastify: FastifyInstance,
    controller: UploadController
): Promise<void> {
    fastify.addHook("preHandler", requireAuth);

    fastify.post('/generate-signature', {
        schema: generateSignatureSchema,
        handler: controller.generateSignature,
    });

    console.log('Upload route registered');
}
