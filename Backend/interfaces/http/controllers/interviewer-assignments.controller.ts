import { injectable, inject } from 'inversify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../../shared/http/apiResponse.js';
import { TYPES } from '../../../infrastructure/di/types.js';
import { InterviewMapper } from '../../../application/interview/mappers/InterviewMapper.js';
import type { IListInterviewerAssignmentsUseCase } from '../../../application/interview/ports/usecase/IListInterviewerAssignmentsUseCase.js';
import type { IAcceptInterviewAssignmentUseCase } from '../../../application/interview/ports/usecase/IAcceptInterviewAssignmentUseCase.js';
import type { IRejectInterviewAssignmentUseCase } from '../../../application/interview/ports/usecase/IRejectInterviewAssignmentUseCase.js';
import type { IListCompletedInterviewsForInterviewerUseCase } from '../../../application/interview/ports/usecase/IListCompletedInterviewsForInterviewerUseCase.js';
import type { ISaveInterviewFeedbackUseCase } from '../../../application/interview/ports/usecase/ISaveInterviewFeedbackUseCase.js';

@injectable()
export class InterviewerAssignmentsController {
  constructor(
    @inject(TYPES.ListInterviewerAssignmentsUseCasePort)
    private readonly listAssignmentsUseCase: IListInterviewerAssignmentsUseCase,
    @inject(TYPES.AcceptInterviewAssignmentUseCasePort)
    private readonly acceptAssignmentUseCase: IAcceptInterviewAssignmentUseCase,
    @inject(TYPES.RejectInterviewAssignmentUseCasePort)
    private readonly rejectAssignmentUseCase: IRejectInterviewAssignmentUseCase,
    @inject(TYPES.ListCompletedInterviewsForInterviewerUseCasePort)
    private readonly listCompletedUseCase: IListCompletedInterviewsForInterviewerUseCase,
    @inject(TYPES.SaveInterviewFeedbackUseCasePort)
    private readonly saveFeedbackUseCase: ISaveInterviewFeedbackUseCase
  ) {}

  list = async (
    request: FastifyRequest<{
      Querystring: { search?: string; page?: string; limit?: string; sortOrder?: string; acceptedOnly?: string };
    }>,
    reply: FastifyReply
  ) => {
    const input = InterviewMapper.toListInterviewerAssignmentsInput(
      request.query,
      request.currentUser.userId
    );
    const result = await this.listAssignmentsUseCase.execute(input);
    reply.send(success({ data: result.data, total: result.total }));
  };

  listCompleted = async (
    request: FastifyRequest<{
      Querystring: { search?: string; page?: string; limit?: string; sortOrder?: string };
    }>,
    reply: FastifyReply
  ) => {
    const input = InterviewMapper.toListCompletedInterviewsInput(
      request.query,
      request.currentUser.userId
    );
    const result = await this.listCompletedUseCase.execute(input);
    reply.send(success({ data: result.data, total: result.total }));
  };

  accept = async (request: FastifyRequest<{ Params: { interviewId: string } }>, reply: FastifyReply) => {
    const input = InterviewMapper.toAcceptAssignmentInput(
      request.params,
      request.currentUser.userId
    );
    const result = await this.acceptAssignmentUseCase.execute(input);
    reply.send(success({ data: result.data }));
  };

  reject = async (
    request: FastifyRequest<{
      Params: { interviewId: string };
      Body: { reason?: string };
    }>,
    reply: FastifyReply
  ) => {
    const input = InterviewMapper.toRejectAssignmentInput(
      request.params,
      request.body ?? {},
      request.currentUser.userId
    );
    const result = await this.rejectAssignmentUseCase.execute(input);
    reply.send(success({ data: result.data }));
  };

  submitFeedback = async (
    request: FastifyRequest<{
      Params: { interviewId: string };
      Body: { feedback?: string; totalScore?: number };
    }>,
    reply: FastifyReply
  ) => {
    const input = InterviewMapper.toSubmitFeedbackInput(
      request.params,
      request.body ?? {},
      request.currentUser.userId
    );
    const result = await this.saveFeedbackUseCase.execute(input);
    reply.send(success({ data: result }));
  };
}
