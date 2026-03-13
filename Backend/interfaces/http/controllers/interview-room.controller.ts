import { injectable, inject } from 'inversify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../../shared/http/apiResponse.js';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { IGetInterviewRoomDetailsUseCase } from '../../../application/interview/ports/usecase/IGetInterviewRoomDetailsUseCase.js';
import type { IUpdateInterviewStatusUseCase } from '../../../application/interview/ports/usecase/IUpdateInterviewStatusUseCase.js';
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
    private readonly _getInterviewRoomDetailsUseCase: IGetInterviewRoomDetailsUseCase,
    @inject(TYPES.UpdateInterviewStatusUseCasePort)
    private readonly _updateInterviewStatusUseCase: IUpdateInterviewStatusUseCase
  ) {}

  getRoomDetails = async (
    request: FastifyRequest<{ Params: GetRoomParams }>,
    reply: FastifyReply
  ) => {
    const { interviewId } = request.params;
    const { userId, role, companyId } = request.currentUser;

    const result = await this._getInterviewRoomDetailsUseCase.execute({
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

    await this._updateInterviewStatusUseCase.execute({
      interviewId,
      interviewerUserId: userId,
      status,
    });

    reply.send(success({ data: { status } }));
  };
}

