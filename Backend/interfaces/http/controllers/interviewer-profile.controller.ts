import { injectable, inject } from "inversify";
import type { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";
import { TYPES } from "../../../infrastructure/di/types";
import type { IGetInterviewerProfileUseCase } from "../../../application/interviewer/ports/usecase/IGetInterviewerProfileUseCase";
import type { ICreateInterviewerProfileUseCase } from "../../../application/interviewer/ports/usecase/ICreateInterviewerProfileUseCase";
import type { IUpdateInterviewerProfileUseCase } from "../../../application/interviewer/ports/usecase/IUpdateInterviewerProfileUseCase";
import type { IFileStorage } from "../../../application/upload/ports/services/IFileStorage.js";
import { AppError } from "../../../shared/errors/AppError";
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
    private readonly _getProfileUseCase: IGetInterviewerProfileUseCase,
    @inject(TYPES.CreateInterviewerProfileUseCasePort)
    private readonly _createProfileUseCase: ICreateInterviewerProfileUseCase,
    @inject(TYPES.UpdateInterviewerProfileUseCasePort)
    private readonly _updateProfileUseCase: IUpdateInterviewerProfileUseCase,
    @inject(TYPES.FileStoragePort)
    private readonly _fileStorage: IFileStorage
  ) {}

  getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.currentUser!.userId;
    const profile = await this._getProfileUseCase.execute(userId);
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
    const result = await this._createProfileUseCase.execute(dto);
    reply.code(HttpStatus.CREATED).send(success(result));
  };

  updateProfile = async (
    request: FastifyRequest<{ Body: Partial<InterviewerProfileView> }>,
    reply: FastifyReply
  ) => {
    const userId = request.currentUser!.userId;
    const dto = toUpdateDTO(request.body, userId);
    const result = await this._updateProfileUseCase.execute(dto);
    reply.send(success(result));
  };

  getProfilePicViewUrl = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.currentUser!.userId;
    const profile = await this._getProfileUseCase.execute(userId);
    const raw = profile?.profilePicUrl ?? "";
    if (!raw.trim()) throw AppError.notFound("Profile picture not found");
    const url = await this._fileStorage.getSignedViewUrl(raw, 3600);
    reply.send(success({ url }));
  };
}
