import { FastifyRequest, FastifyReply } from 'fastify';
import { UploadFileUseCase } from '../../../application/upload/use-cases/UploadFileUseCase.js';

export class UploadController {
    constructor(private readonly uploadFileUseCase: UploadFileUseCase) { }

    upload = async (request: FastifyRequest, reply: FastifyReply) => {
        const data = await request.file();

        if (!data) {
            return reply.status(400).send({ error: 'No file uploaded' });
        }

        const buffer = await data.toBuffer();

        const result = await this.uploadFileUseCase.execute({
            fileName: data.filename,
            fileBuffer: buffer,
        });

        reply.status(201).send(result);
    };
}
