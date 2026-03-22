import { injectable, inject } from 'inversify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../../shared/http/apiResponse.js';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { IGetInterviewRoomDetailsUseCase } from '../../../application/interview/ports/usecase/IGetInterviewRoomDetailsUseCase.js';
import type { IUpdateInterviewStatusUseCase } from '../../../application/interview/ports/usecase/IUpdateInterviewStatusUseCase.js';
import { InterviewMapper } from '../../../application/interview/mappers/InterviewMapper.js';
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
    const result = await this._getInterviewRoomDetailsUseCase.execute(
      InterviewMapper.toGetInterviewRoomDetailsInput(request.params, request.currentUser),
    );

    reply.send(success({ data: result }));
  };

  updateStatus = async (
    request: FastifyRequest<{
      Params: UpdateStatusParams;
      Body: UpdateStatusBody;
    }>,
    reply: FastifyReply
  ) => {
    await this._updateInterviewStatusUseCase.execute(
      InterviewMapper.toUpdateInterviewStatusInput(
        request.params,
        request.body,
        request.currentUser.userId,
      ),
    );

    reply.send(success({ data: { status: request.body.status } }));
  };
}

