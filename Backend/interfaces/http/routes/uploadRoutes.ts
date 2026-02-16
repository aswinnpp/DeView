import { FastifyInstance } from 'fastify';
import { UploadController } from '../controllers/UploadController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export async function uploadRoutes(
    fastify: FastifyInstance,
    controller: UploadController
): Promise<void> {
    fastify.addHook("preHandler", requireAuth);

    // POST /upload — upload a single file, returns the public URL
    fastify.post('/upload', {
        handler: controller.upload,
    });

    console.log('Upload route registered');
}
