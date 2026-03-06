import { injectable, inject } from 'inversify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../../shared/http/apiResponse.js';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { IListInterviewerAssignmentsUseCase } from '../../../application/interview/use-cases/list-interviewer-assignments.usecase.js';
import type { IAcceptInterviewAssignmentUseCase } from '../../../application/interview/use-cases/accept-interview-assignment.usecase.js';
import type { IRejectInterviewAssignmentUseCase } from '../../../application/interview/use-cases/reject-interview-assignment.usecase.js';

@injectable()
export class InterviewerAssignmentsController {
  constructor(
    @inject(TYPES.ListInterviewerAssignmentsUseCasePort)
    private readonly listAssignmentsUseCase: IListInterviewerAssignmentsUseCase,
    @inject(TYPES.AcceptInterviewAssignmentUseCasePort)
    private readonly acceptAssignmentUseCase: IAcceptInterviewAssignmentUseCase,
    @inject(TYPES.RejectInterviewAssignmentUseCasePort)
    private readonly rejectAssignmentUseCase: IRejectInterviewAssignmentUseCase
  ) {}

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const interviewerUserId = request.currentUser.userId;
    const result = await this.listAssignmentsUseCase.execute({ interviewerUserId });
    reply.send(success({ data: result.data }));
  };

  accept = async (request: FastifyRequest<{ Params: { interviewId: string } }>, reply: FastifyReply) => {
    const interviewerUserId = request.currentUser.userId;
    const { interviewId } = request.params;
    const result = await this.acceptAssignmentUseCase.execute({ interviewId, interviewerUserId });
    if (!result.data) {
      return reply.status(404).send({ success: false, error: 'Interview not found or not assigned to you' });
    }
    reply.send(success({ data: result.data }));
  };

  reject = async (
    request: FastifyRequest<{
      Params: { interviewId: string };
      Body: { reason?: string };
    }>,
    reply: FastifyReply
  ) => {
    const interviewerUserId = request.currentUser.userId;
    const { interviewId } = request.params;
    const reason = (request.body?.reason ?? '').trim();
    if (!reason) {
      return reply.status(400).send({ success: false, error: 'Rejection reason is required' });
    }
    const result = await this.rejectAssignmentUseCase.execute({ interviewId, interviewerUserId, reason });
    if (!result.data) {
      return reply.status(404).send({ success: false, error: 'Interview not found or not assigned to you' });
    }
    reply.send(success({ data: result.data }));
  };
}
