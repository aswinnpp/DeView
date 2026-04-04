import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { TYPES } from "../../../infrastructure/di/types";
import type { IGetCompanyProfileUseCase } from "../../../application/company/ports/usecase/IGetCompanyProfileUseCase";
import type { IUpdateCompanyProfileUseCase } from "../../../application/company/ports/usecase/IUpdateCompanyProfileUseCase";
import type { IGetCompanyLogoViewUrlUseCase } from "../../../application/company/ports/usecase/IGetCompanyLogoViewUrlUseCase";
import { CompanyProfileMapper } from "../../../application/company/mappers/CompanyProfileMapper.js";

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
    @inject(TYPES.GetCompanyLogoViewUrlUseCasePort)
    private readonly _getCompanyLogoViewUrlUseCase: IGetCompanyLogoViewUrlUseCase,
  ) {}

  getProfile = async (
    request: FastifyRequest<{ Querystring: GetProfileQuery }>,
    reply: FastifyReply,
  ) => {
    const user = request.currentUser;
    const page = Math.max(1, Number(request.query.page ?? 1) || 1);
    const limit = Math.max(1, Math.min(50, Number(request.query.limit ?? 8) || 8));

    const data = await this._getProfileUseCase.execute({
      userId: user.userId,
      page,
      limit,
    });

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
    const { url } = await this._getCompanyLogoViewUrlUseCase.execute(user.userId);
    reply.send(success({ url }));
  };
}
