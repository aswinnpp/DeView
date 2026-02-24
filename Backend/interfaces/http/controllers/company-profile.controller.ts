import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { TYPES } from "../../../infrastructure/di/types";
import type { IGetCompanyProfileUseCase } from "../../../application/company/ports/usecase/IGetCompanyProfileUseCase";
import type { IUpdateCompanyProfileUseCase } from "../../../application/company/ports/usecase/IUpdateCompanyProfileUseCase";
import { CompanyProfileMapper } from "../mappers/company-profile.mapper.js";

interface IUpdateProfileBody {
  companyName?: string;
  address?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  taxId?: string;
  website?: string;
  numberOfEmployees?: string;
}

@injectable()
export class CompanyProfileController {
  constructor(
    @inject(TYPES.GetCompanyProfileUseCasePort) private readonly getProfileUseCase: IGetCompanyProfileUseCase,
    @inject(TYPES.UpdateCompanyProfileUseCasePort) private readonly updateProfileUseCase: IUpdateCompanyProfileUseCase,
  ) {}

  getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.currentUser;

    const profile = await this.getProfileUseCase.execute(user.userId);

    reply.send(success({ data: profile }));
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
