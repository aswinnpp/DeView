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
    private readonly _listAssignmentsUseCase: IListInterviewerAssignmentsUseCase,
    @inject(TYPES.AcceptInterviewAssignmentUseCasePort)
    private readonly _acceptAssignmentUseCase: IAcceptInterviewAssignmentUseCase,
    @inject(TYPES.RejectInterviewAssignmentUseCasePort)
    private readonly _rejectAssignmentUseCase: IRejectInterviewAssignmentUseCase,
    @inject(TYPES.ListCompletedInterviewsForInterviewerUseCasePort)
    private readonly _listCompletedUseCase: IListCompletedInterviewsForInterviewerUseCase,
    @inject(TYPES.SaveInterviewFeedbackUseCasePort)
    private readonly _saveFeedbackUseCase: ISaveInterviewFeedbackUseCase
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
    const result = await this._listAssignmentsUseCase.execute(input);
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
    const result = await this._listCompletedUseCase.execute(input);
    reply.send(success({ data: result.data, total: result.total }));
  };

  accept = async (request: FastifyRequest<{ Params: { interviewId: string } }>, reply: FastifyReply) => {
    const input = InterviewMapper.toAcceptAssignmentInput(
      request.params,
      request.currentUser.userId
    );
    const result = await this._acceptAssignmentUseCase.execute(input);
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
    const result = await this._rejectAssignmentUseCase.execute(input);
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
    const result = await this._saveFeedbackUseCase.execute(input);
    reply.send(success({ data: result }));
  };
}
