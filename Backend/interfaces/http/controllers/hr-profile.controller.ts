import { injectable, inject } from "inversify";
import type { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";
import { TYPES } from "../../../infrastructure/di/types";
import type { IGetHrProfileUseCase } from "../../../application/hr/ports/usecase/IGetHrProfileUseCase";
import type { ICreateHrProfileUseCase } from "../../../application/hr/ports/usecase/ICreateHrProfileUseCase";
import type { IUpdateHrProfileUseCase } from "../../../application/hr/ports/usecase/IUpdateHrProfileUseCase";
import type { IFileStorage } from "../../../application/upload/ports/services/IFileStorage.js";
import {
  toProfileStateView,
  toCreateDTO,
  toUpdateDTO,
  toProfilePicStorageKey,
  type HrProfileView,
} from "../../../application/hr/mappers/HrProfileMapper";

@injectable()
export class HrProfileController {
  constructor(
    @inject(TYPES.GetHrProfileUseCasePort)
    private readonly _getProfileUseCase: IGetHrProfileUseCase,
    @inject(TYPES.CreateHrProfileUseCasePort)
    private readonly _createProfileUseCase: ICreateHrProfileUseCase,
    @inject(TYPES.UpdateHrProfileUseCasePort)
    private readonly _updateProfileUseCase: IUpdateHrProfileUseCase,
    @inject(TYPES.FileStoragePort)
    private readonly _fileStorage: IFileStorage
  ) {}

  getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.currentUser!.userId;
    const profile = await this._getProfileUseCase.execute(userId);
    reply.send(success(toProfileStateView(profile)));
  };

  createProfile = async (request: FastifyRequest<{ Body: HrProfileView }>, reply: FastifyReply) => {
    const userId = request.currentUser!.userId;
    const dto = toCreateDTO(request.body, userId);
    const result = await this._createProfileUseCase.execute(dto);
    reply.code(HttpStatus.CREATED).send(success(result));
  };

  updateProfile = async (
    request: FastifyRequest<{ Body: Partial<HrProfileView> }>,
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
    const key = toProfilePicStorageKey(profile);
    const url = await this._fileStorage.getSignedViewUrl(key, 3600);
    reply.send(success({ url }));
  };
}
