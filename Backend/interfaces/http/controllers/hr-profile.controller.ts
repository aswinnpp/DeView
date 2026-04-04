import { injectable, inject } from "inversify";
import type { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";
import { TYPES } from "../../../infrastructure/di/types";
import type { IGetHrProfileUseCase } from "../../../application/hr/ports/usecase/IGetHrProfileUseCase";
import type { ICreateHrProfileUseCase } from "../../../application/hr/ports/usecase/ICreateHrProfileUseCase";
import type { IUpdateHrProfileUseCase } from "../../../application/hr/ports/usecase/IUpdateHrProfileUseCase";
import type { IGetHrProfilePicViewUrlUseCase } from "../../../application/hr/ports/usecase/IGetHrProfilePicViewUrlUseCase";
import {
  toCreateDTO,
  toUpdateDTO,
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
    @inject(TYPES.GetHrProfilePicViewUrlUseCasePort)
    private readonly _getHrProfilePicViewUrlUseCase: IGetHrProfilePicViewUrlUseCase
  ) {}

  getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.currentUser!.userId;
    const data = await this._getProfileUseCase.execute(userId);
    reply.send(success(data));
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
    const { url } = await this._getHrProfilePicViewUrlUseCase.execute(userId);
    reply.send(success({ url }));
  };
}
