import { injectable, inject } from 'inversify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../../shared/http/apiResponse.js';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { GetInterviewRoomDetailsUseCase } from '../../../application/interview/use-cases/get-interview-room-details.usecase.js';
import type { UpdateInterviewStatusUseCase } from '../../../application/interview/use-cases/update-interview-status.usecase.js';
type GetRoomParams = {
  interviewId: string;
};

type UpdateStatusParams = {
  interviewId: string;
};

type UpdateStatusBody = {
  status: 'COMPLETED' | 'CANCELLED';
};

@injectable()
export class InterviewRoomController {
  constructor(
    @inject(TYPES.GetInterviewRoomDetailsUseCasePort)
    private readonly getInterviewRoomDetailsUseCase: GetInterviewRoomDetailsUseCase,
    @inject(TYPES.UpdateInterviewStatusUseCasePort)
    private readonly updateInterviewStatusUseCase: UpdateInterviewStatusUseCase
  ) {}

  getRoomDetails = async (
    request: FastifyRequest<{ Params: GetRoomParams }>,
    reply: FastifyReply
  ) => {
    const { interviewId } = request.params;
    const { userId, role, companyId } = request.currentUser;

    const result = await this.getInterviewRoomDetailsUseCase.execute({
      interviewId,
      userId,
      role,
      companyId,
    });

    reply.send(success({ data: result }));
  };

  updateStatus = async (
    request: FastifyRequest<{
      Params: UpdateStatusParams;
      Body: UpdateStatusBody;
    }>,
    reply: FastifyReply
  ) => {
    const { interviewId } = request.params;
    const { status } = request.body;
    const { userId } = request.currentUser;

    await this.updateInterviewStatusUseCase.execute({
      interviewId,
      interviewerUserId: userId,
      status,
    });

    reply.send(success({ data: { status } }));
  };
}

