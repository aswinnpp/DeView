import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { TYPES } from "../../../infrastructure/di/types";
import type { IGetCompanyProfileUseCase } from "../../../application/company/ports/usecase/IGetCompanyProfileUseCase";
import type { IUpdateCompanyProfileUseCase } from "../../../application/company/ports/usecase/IUpdateCompanyProfileUseCase";
import { CompanyProfileMapper } from "../../../application/company/mappers/CompanyProfileMapper.js";
import type { IFileStorage } from "../../../application/upload/ports/services/IFileStorage.js";
import { AppError } from "../../../shared/errors/AppError";

interface IUpdateProfileBody {
  companyName?: string;
  location?: string;
  address?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  taxId?: string;
  website?: string;
  numberOfEmployees?: string;
  logoUrl?: string;
}

type GetProfileQuery = {
  page?: string;
  limit?: string;
};

@injectable()
export class CompanyProfileController {
  constructor(
    @inject(TYPES.GetCompanyProfileUseCasePort) private readonly _getProfileUseCase: IGetCompanyProfileUseCase,
    @inject(TYPES.UpdateCompanyProfileUseCasePort) private readonly _updateProfileUseCase: IUpdateCompanyProfileUseCase,
    @inject(TYPES.FileStoragePort) private readonly _fileStorage: IFileStorage,
  ) {}

  getProfile = async (
    request: FastifyRequest<{ Querystring: GetProfileQuery }>,
    reply: FastifyReply,
  ) => {
    const user = request.currentUser;
    const page = Math.max(1, Number(request.query.page ?? 1) || 1);
    const limit = Math.max(1, Math.min(50, Number(request.query.limit ?? 8) || 8));

    const profile = await this._getProfileUseCase.execute(user.userId);
    const data = CompanyProfileMapper.toProfileResponse(profile, { page, limit });

    reply.send(success({ data }));
  };

  updateProfile = async (
    request: FastifyRequest<{ Body: IUpdateProfileBody }>,
    reply: FastifyReply,
  ) => {
    const ctx = { userId: request.currentUser.userId, companyId: request.currentUser.companyId };
    const dto = CompanyProfileMapper.toUpdateDTO(request.body, ctx);
    const result = await this._updateProfileUseCase.execute(dto);
    reply.send(success(result));
  };

  getLogoViewUrl = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.currentUser;
    const profile = await this._getProfileUseCase.execute(user.userId);
    const raw = (profile as unknown as { logoUrl?: string } | null)?.logoUrl ?? '';
    if (!raw.trim()) throw AppError.notFound("Company logo not found");
    const url = await this._fileStorage.getSignedViewUrl(raw, 3600);
    reply.send(success({ url }));
  };
}
