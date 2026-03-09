import { injectable, inject } from 'inversify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../../shared/http/apiResponse.js';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { IListMyInterviewsUseCase } from '../../../application/interview/use-cases/list-my-interviews.usecase.js';
import type { IRequestCandidateRescheduleUseCase } from '../../../application/interview/use-cases/request-candidate-reschedule.usecase.js';
import type { IListMyInterviewFeedbacksUseCase } from '../../../application/interview/use-cases/list-my-interview-feedbacks.usecase.js';

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
    const candidateUserId = request.currentUser.userId;
    const { search, page, limit, sortOrder } = request.query;
    const parsedPage = page != null && page !== '' ? parseInt(page, 10) : undefined;
    const parsedLimit = limit != null && limit !== '' ? parseInt(limit, 10) : undefined;
    const validSortOrder = sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : undefined;
    const result = await this.listMyInterviewsUseCase.execute({
      candidateUserId,
      search: search?.trim() || undefined,
      page: Number.isFinite(parsedPage) && parsedPage! >= 1 ? parsedPage : undefined,
      limit: Number.isFinite(parsedLimit) && parsedLimit! >= 1 ? parsedLimit : undefined,
      sortOrder: validSortOrder,
    });
    reply.send(success({ data: result.data, total: result.total }));
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

  listMyFeedbacks = async (
    request: FastifyRequest<{
      Querystring: { search?: string; page?: string; limit?: string; sortOrder?: string };
    }>,
    reply: FastifyReply
  ) => {
    const candidateUserId = request.currentUser.userId;
    const { search, page, limit, sortOrder } = request.query;
    const parsedPage = page != null && page !== '' ? parseInt(page, 10) : undefined;
    const parsedLimit = limit != null && limit !== '' ? parseInt(limit, 10) : undefined;
    const validSortOrder = sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : undefined;
    const result = await this.listMyInterviewFeedbacksUseCase.execute({
      candidateUserId,
      search: search?.trim() || undefined,
      page: Number.isFinite(parsedPage) && parsedPage! >= 1 ? parsedPage : undefined,
      limit: Number.isFinite(parsedLimit) && parsedLimit! >= 1 ? parsedLimit : undefined,
      sortOrder: validSortOrder,
    });
    reply.send(success({ data: result.data, total: result.total }));
  };
}

