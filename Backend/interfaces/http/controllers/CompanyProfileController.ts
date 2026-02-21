import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { TYPES } from "../../../infrastructure/di/types";
import type { GetCompanyProfileUseCasePort } from "../../../application/company/ports/usecase/GetCompanyProfileUseCasePort";
import type { UpdateCompanyProfileUseCasePort } from "../../../application/company/ports/usecase/UpdateCompanyProfileUseCasePort";
import { CompanyProfileMapper } from "../mappers/CompanyProfileMapper.js";

/** Body shape from Zod-validated request (flat, normalized) */
interface UpdateProfileBody {
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
    @inject(TYPES.GetCompanyProfileUseCasePort) private readonly getProfileUseCase: GetCompanyProfileUseCasePort,
    @inject(TYPES.UpdateCompanyProfileUseCasePort) private readonly updateProfileUseCase: UpdateCompanyProfileUseCasePort,
  ) {}

  getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.currentUser;

    const profile = await this.getProfileUseCase.execute(user.userId);

    reply.send(success({ data: profile }));
  };

  updateProfile = async (
    request: FastifyRequest<{ Body: UpdateProfileBody }>,
    reply: FastifyReply,
  ) => {
    const dto = CompanyProfileMapper.toUpdateDTO(request.body, request.currentUser);
    const result = await this.updateProfileUseCase.execute(dto);
    reply.send(success(result));
  };
}
