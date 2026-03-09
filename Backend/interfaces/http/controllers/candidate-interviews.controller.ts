import { injectable, inject } from 'inversify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../../shared/http/apiResponse.js';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { IListMyInterviewsUseCase } from '../../../application/interview/use-cases/list-my-interviews.usecase.js';
import type { IRequestCandidateRescheduleUseCase } from '../../../application/interview/use-cases/request-candidate-reschedule.usecase.js';

@injectable()
export class CandidateInterviewsController {
  constructor(
    @inject(TYPES.ListMyInterviewsUseCasePort)
    private readonly listMyInterviewsUseCase: IListMyInterviewsUseCase,
    @inject(TYPES.RequestCandidateRescheduleUseCasePort)
    private readonly requestCandidateRescheduleUseCase: IRequestCandidateRescheduleUseCase
  ) {}

  listMy = async (request: FastifyRequest, reply: FastifyReply) => {
    const candidateUserId = request.currentUser.userId;
    const result = await this.listMyInterviewsUseCase.execute({ candidateUserId });
    reply.send(success({ data: result.data }));
  };

  requestReschedule = async (
    request: FastifyRequest<{
      Params: { interviewId: string };
      Body: { requestedDate: string; reason: string };
    }>,
    reply: FastifyReply
  ) => {
    const candidateUserId = request.currentUser.userId;
    const { interviewId } = request.params;
    const body = request.body;

    const result = await this.requestCandidateRescheduleUseCase.execute({
      interviewId,
      candidateUserId,
      requestedDate: body.requestedDate,
      reason: body.reason,
    });

    reply.send(success({ interview: result.interview }));
  };
}

