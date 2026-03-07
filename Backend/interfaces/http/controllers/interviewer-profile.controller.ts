import { injectable, inject } from "inversify";
import type { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";
import { TYPES } from "../../../infrastructure/di/types";
import type { IGetInterviewerProfileUseCase } from "../../../application/interviewer/ports/usecase/IGetInterviewerProfileUseCase";
import type { ICreateInterviewerProfileUseCase } from "../../../application/interviewer/ports/usecase/ICreateInterviewerProfileUseCase";
import type { IUpdateInterviewerProfileUseCase } from "../../../application/interviewer/ports/usecase/IUpdateInterviewerProfileUseCase";
import {
  toView,
  toCreateDTO,
  toUpdateDTO,
  type InterviewerProfileView,
} from "../../../application/interviewer/mappers/InterviewerProfileMapper";

@injectable()
export class InterviewerProfileController {
  constructor(
    @inject(TYPES.GetInterviewerProfileUseCasePort)
    private readonly getProfileUseCase: IGetInterviewerProfileUseCase,
    @inject(TYPES.CreateInterviewerProfileUseCasePort)
    private readonly createProfileUseCase: ICreateInterviewerProfileUseCase,
    @inject(TYPES.UpdateInterviewerProfileUseCasePort)
    private readonly updateProfileUseCase: IUpdateInterviewerProfileUseCase
  ) {}

  getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.currentUser!.userId;
    const profile = await this.getProfileUseCase.execute(userId);
    const hasProfile = profile !== null;
    const data = profile ? toView(profile) : undefined;
    reply.send(success({ hasProfile, data }));
  };

  createProfile = async (
    request: FastifyRequest<{ Body: InterviewerProfileView }>,
    reply: FastifyReply
  ) => {
    const userId = request.currentUser!.userId;
    const dto = toCreateDTO(request.body, userId);
    const result = await this.createProfileUseCase.execute(dto);
    reply.code(HttpStatus.CREATED).send(success(result));
  };

  updateProfile = async (
    request: FastifyRequest<{ Body: Partial<InterviewerProfileView> }>,
    reply: FastifyReply
  ) => {
    const userId = request.currentUser!.userId;
    const dto = toUpdateDTO(request.body, userId);
    const result = await this.updateProfileUseCase.execute(dto);
    reply.send(success(result));
  };
}
