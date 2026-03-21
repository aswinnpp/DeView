import { injectable, inject } from 'inversify';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../../shared/di/types.js';
import { success } from '../../../shared/http/apiResponse.js';
import type { IGetCompilerLanguagesUseCase } from '../../../application/compiler/ports/usecase/IGetCompilerLanguagesUseCase.js';
import type { IExecuteCodeUseCase } from '../../../application/compiler/ports/usecase/IExecuteCodeUseCase.js';

@injectable()
export class CompilerController {
  constructor(
    @inject(TYPES.GetCompilerLanguagesUseCasePort)
    private readonly getLanguagesUseCase: IGetCompilerLanguagesUseCase,
    @inject(TYPES.ExecuteCodeUseCasePort)
    private readonly executeCodeUseCase: IExecuteCodeUseCase
  ) {}

  healthCheck = async (_request: FastifyRequest, reply: FastifyReply) => {
    await this.getLanguagesUseCase.execute();
    return reply.send(success({ data: { reachable: true } }));
  };

  getLanguages = async (_request: FastifyRequest, reply: FastifyReply) => {
    const languages = await this.getLanguagesUseCase.execute();
    return reply.send(success({ data: languages }));
  };

  executeCode = async (
    request: FastifyRequest<{
      Body: { code: string; languageId: number; stdin?: string };
    }>,
    reply: FastifyReply
  ) => {
    const { code, languageId, stdin } = request.body;
    const result = await this.executeCodeUseCase.execute({ code, languageId, stdin });
    return reply.send(success({ data: result }));
  };
}
