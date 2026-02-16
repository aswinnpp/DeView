import { FastifyRequest, FastifyReply } from 'fastify';
import { success } from '../../../shared/http/apiResponse';
import { GenerateUploadSignatureUseCase } from '../../../application/upload/use-cases/GenerateUploadSignatureUseCase.js';

export class UploadController {
    constructor(private readonly generateSignatureUseCase: GenerateUploadSignatureUseCase) {}

    generateSignature = async (
        request: FastifyRequest<{ Body: { category: string } }>,
        reply: FastifyReply
    ) => {
        const user = request.currentUser;
        const { category } = request.body;

        const result = await this.generateSignatureUseCase.execute({
            category,
            userId: user.userId,
        });

        reply.send(success(result));
    };
}
