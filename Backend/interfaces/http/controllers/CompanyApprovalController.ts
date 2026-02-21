import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";
import { TYPES } from "../../../infrastructure/di/types";
import type { CheckCompanyStatusUseCasePort } from "../../../application/company/ports/usecase/CheckCompanyStatusUseCasePort";
import type { SubmitCompanyApprovalUseCasePort } from "../../../application/company/ports/usecase/SubmitCompanyApprovalUseCasePort";
import type { GetMyCompanyApprovalUseCasePort } from "../../../application/company/ports/usecase/GetMyCompanyApprovalUseCasePort";
import { CompanyApprovalMapper } from "../mappers/CompanyApprovalMapper.js";

/** Body shape from Zod-validated request */
interface SubmitApprovalBody {
  companyName: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  taxId: string;
  website?: string;
  numberOfEmployees: string;
  documents: Record<string, unknown>;
}

@injectable()
export class CompanyApprovalController {
  constructor(
    @inject(TYPES.CheckCompanyStatusUseCasePort) private readonly checkStatusUseCase: CheckCompanyStatusUseCasePort,
    @inject(TYPES.SubmitCompanyApprovalUseCasePort) private readonly submitApprovalUseCase: SubmitCompanyApprovalUseCasePort,
    @inject(TYPES.GetMyCompanyApprovalUseCasePort) private readonly getMyApprovalUseCase: GetMyCompanyApprovalUseCasePort,
  ) {}

  // POST /company/check-status — uses authenticated user
  checkStatus = async (request: FastifyRequest, reply: FastifyReply) => {
    const dto = CompanyApprovalMapper.toCheckStatusDTO(request.currentUser);
    const result = await this.checkStatusUseCase.execute(dto);
    reply.send(success(result));
  };

  getMyApproval = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.currentUser;

    const approval = await this.getMyApprovalUseCase.execute(user.userId);

    reply.send(success(approval));
  };

  submit = async (
    request: FastifyRequest<{ Body: SubmitApprovalBody }>,
    reply: FastifyReply,
  ) => {
    const dto = CompanyApprovalMapper.toSubmitDTO(request.body, request.currentUser);
    const result = await this.submitApprovalUseCase.execute(dto);
    reply.code(HttpStatus.CREATED).send(success({
      message: "Approval submitted",
      approvalId: result.approvalId,
    }));
  };
}
