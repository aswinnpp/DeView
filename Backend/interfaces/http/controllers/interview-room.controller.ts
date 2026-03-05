import { injectable, inject } from 'inversify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../../shared/http/apiResponse.js';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { GetInterviewRoomDetailsUseCase } from '../../../application/interview/use-cases/get-interview-room-details.usecase.js';

type GetRoomParams = {
  interviewId: string;
};

@injectable()
export class InterviewRoomController {
  constructor(
    @inject(TYPES.GetInterviewRoomDetailsUseCasePort)
    private readonly getInterviewRoomDetailsUseCase: GetInterviewRoomDetailsUseCase
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
}

