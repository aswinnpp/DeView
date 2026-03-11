import { injectable, inject } from 'inversify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../../shared/http/apiResponse.js';
import { TYPES } from '../../../infrastructure/di/types.js';
import { InterviewMapper } from '../../../application/interview/mappers/InterviewMapper.js';
import type { IListMyInterviewsUseCase } from '../../../application/interview/ports/usecase/IListMyInterviewsUseCase.js';
import type { IRequestCandidateRescheduleUseCase } from '../../../application/interview/ports/usecase/IRequestCandidateRescheduleUseCase.js';
import type { IListMyInterviewFeedbacksUseCase } from '../../../application/interview/ports/usecase/IListMyInterviewFeedbacksUseCase.js';

@injectable()
export class CandidateInterviewsController {
  constructor(
    @inject(TYPES.ListMyInterviewsUseCasePort)
    private readonly listMyInterviewsUseCase: IListMyInterviewsUseCase,
    @inject(TYPES.RequestCandidateRescheduleUseCasePort)
    private readonly requestCandidateRescheduleUseCase: IRequestCandidateRescheduleUseCase,
    @inject(TYPES.ListMyInterviewFeedbacksUseCasePort)
    private readonly listMyInterviewFeedbacksUseCase: IListMyInterviewFeedbacksUseCase
  ) {}

  listMy = async (
    request: FastifyRequest<{
      Querystring: { search?: string; page?: string; limit?: string; sortOrder?: string };
    }>,
    reply: FastifyReply
  ) => {
    const input = InterviewMapper.toListMyInterviewsInput(
      request.query,
      request.currentUser.userId
    );
    const result = await this.listMyInterviewsUseCase.execute(input);
    reply.send(success({ data: result.data, total: result.total }));
  };

  requestReschedule = async (
    request: FastifyRequest<{
      Params: { interviewId: string };
      Body: { requestedDate: string; reason: string };
    }>,
    reply: FastifyReply
  ) => {
    const input = InterviewMapper.toRequestRescheduleInput(
      request.params,
      request.body,
      request.currentUser.userId
    );
    const result = await this.requestCandidateRescheduleUseCase.execute(input);
    reply.send(success({ interview: result.interview }));
  };

  listMyFeedbacks = async (
    request: FastifyRequest<{
      Querystring: { search?: string; page?: string; limit?: string; sortOrder?: string };
    }>,
    reply: FastifyReply
  ) => {
    const input = InterviewMapper.toListMyFeedbacksInput(
      request.query,
      request.currentUser.userId
    );
    const result = await this.listMyInterviewFeedbacksUseCase.execute(input);
    reply.send(success({ data: result.data, total: result.total }));
  };
}

