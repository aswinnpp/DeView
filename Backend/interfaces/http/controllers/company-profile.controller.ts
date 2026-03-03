import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { TYPES } from "../../../infrastructure/di/types";
import type { IGetCompanyProfileUseCase } from "../../../application/company/ports/usecase/IGetCompanyProfileUseCase";
import type { IUpdateCompanyProfileUseCase } from "../../../application/company/ports/usecase/IUpdateCompanyProfileUseCase";
import { CompanyProfileMapper } from "../mappers/company-profile.mapper.js";

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
}

type GetProfileQuery = {
  page?: string;
  limit?: string;
};

@injectable()
export class CompanyProfileController {
  constructor(
    @inject(TYPES.GetCompanyProfileUseCasePort) private readonly getProfileUseCase: IGetCompanyProfileUseCase,
    @inject(TYPES.UpdateCompanyProfileUseCasePort) private readonly updateProfileUseCase: IUpdateCompanyProfileUseCase,
  ) {}

  getProfile = async (
    request: FastifyRequest<{ Querystring: GetProfileQuery }>,
    reply: FastifyReply,
  ) => {
    const user = request.currentUser;
    const page = Math.max(1, Number(request.query.page ?? 1) || 1);
    const limit = Math.max(1, Math.min(50, Number(request.query.limit ?? 8) || 8));

    const profile = await this.getProfileUseCase.execute(user.userId);
    const data = CompanyProfileMapper.toProfileResponse(profile, { page, limit });

    reply.send(success({ data }));
  };

  updateProfile = async (
    request: FastifyRequest<{ Body: IUpdateProfileBody }>,
    reply: FastifyReply,
  ) => {
    const dto = CompanyProfileMapper.toUpdateDTO(request.body, request.currentUser);
    const result = await this.updateProfileUseCase.execute(dto);
    reply.send(success(result));
  };
}
