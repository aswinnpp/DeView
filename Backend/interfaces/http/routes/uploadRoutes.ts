import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/authMiddleware.js';
import { env } from '../../../infrastructure/config/env.js';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function uploadRoutes(fastify: FastifyInstance): Promise<void> {
    // POST /upload — upload a single file, returns the public URL
    fastify.post('/upload', {
        preHandler: [requireAuth],
        handler: async (request, reply) => {
            const data = await request.file();

            if (!data) {
                return reply.status(400).send({ error: 'No file uploaded' });
            }

            // Build a unique filename: uuid.ext
            const ext = path.extname(data.filename);
            const safeName = `${randomUUID()}${ext}`;
            const filePath = path.join(UPLOADS_DIR, safeName);

            // Write to disk
            const buffer = await data.toBuffer();
            fs.writeFileSync(filePath, buffer);

            // Build public URL (served by @fastify/static)
            const fileUrl = `http://localhost:${env.PORT}/uploads/${safeName}`;

            reply.status(201).send({
                fileName: data.filename,
                fileUrl,
                uploadedAt: new Date().toISOString(),
            });
        },
    });

    console.log('✅ Upload route registered');
}
