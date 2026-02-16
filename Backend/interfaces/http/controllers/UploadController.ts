import { FastifyRequest, FastifyReply } from 'fastify';
import { UploadFileUseCase } from '../../../application/upload/use-cases/UploadFileUseCase.js';

export class UploadController {
    constructor(private readonly uploadFileUseCase: UploadFileUseCase) {}

    upload = async (request: FastifyRequest, reply: FastifyReply) => {
        const data = await request.file();
        const buffer = data ? await data.toBuffer() : Buffer.from([]);

        const result = await this.uploadFileUseCase.execute({
            fileName: data?.filename ?? '',
            fileBuffer: buffer,
        });

        reply.status(201).send(result);
    };
}
