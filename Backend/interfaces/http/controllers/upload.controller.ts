import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { success } from '../../../shared/http/apiResponse';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { IGenerateUploadSignatureUseCase } from '../../../application/upload/ports/usecase/IGenerateUploadSignatureUseCase.js';

@injectable()
export class UploadController {
    constructor(@inject(TYPES.GenerateUploadSignatureUseCasePort) private readonly _generateSignatureUseCase: IGenerateUploadSignatureUseCase) {}

    generateSignature = async (
        request: FastifyRequest<{ Body: { category: string } }>,
        reply: FastifyReply
    ) => {
        const user = request.currentUser;
        const { category } = request.body;

        const result = await this._generateSignatureUseCase.execute({
            category,
            userId: user.userId,
        });

        reply.send(success(result));
    };
}
