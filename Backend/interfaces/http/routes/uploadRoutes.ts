import { FastifyInstance } from 'fastify';
import { UploadController } from '../controllers/UploadController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export async function uploadRoutes(
    fastify: FastifyInstance,
    controller: UploadController
): Promise<void> {
    // POST /upload — upload a single file, returns the public URL
    fastify.post('/upload', {
        preHandler: [requireAuth],
        handler: controller.upload,
    });

    console.log('✅ Upload route registered');
}
