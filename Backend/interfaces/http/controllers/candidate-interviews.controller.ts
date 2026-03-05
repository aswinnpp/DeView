import { injectable, inject } from 'inversify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../../shared/http/apiResponse.js';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { IListMyInterviewsUseCase } from '../../../application/interview/use-cases/list-my-interviews.usecase.js';

@injectable()
export class CandidateInterviewsController {
  constructor(
    @inject(TYPES.ListMyInterviewsUseCasePort)
    private readonly listMyInterviewsUseCase: IListMyInterviewsUseCase
  ) {}

  listMy = async (request: FastifyRequest, reply: FastifyReply) => {
    const candidateUserId = request.currentUser.userId;
    const result = await this.listMyInterviewsUseCase.execute({ candidateUserId });
    reply.send(success({ data: result.data }));
  };
}

