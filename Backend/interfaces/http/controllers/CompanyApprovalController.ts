import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";
import { CheckCompanyStatusUseCase } from "../../../application/company/use-cases/CheckCompanyStatusUseCase";
import { SubmitCompanyApprovalUseCase } from "../../../application/company/use-cases/SubmitCompanyApprovalUseCase";
import { GetMyCompanyApprovalUseCase } from "../../../application/company/use-cases/GetMyCompanyApprovalUseCase";
import { CompanyDocuments } from "../../../infrastructure/persistence/mongodb/schemas/CompanyApprovalDocument";

interface CheckStatusBody {
  userId: string;
}

interface SubmitApprovalBody {
  companyName: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  taxId: string;
  website?: string;
  numberOfEmployees: string;
  documents: CompanyDocuments;
}

@injectable()
export class CompanyApprovalController {
  constructor(
    @inject(CheckCompanyStatusUseCase) private readonly checkStatusUseCase: CheckCompanyStatusUseCase,
    @inject(SubmitCompanyApprovalUseCase) private readonly submitApprovalUseCase: SubmitCompanyApprovalUseCase,
    @inject(GetMyCompanyApprovalUseCase) private readonly getMyApprovalUseCase: GetMyCompanyApprovalUseCase,
  ) {}

  // POST /company/check-status
  checkStatus = async (
    request: FastifyRequest<{ Body: CheckStatusBody }>,
    reply: FastifyReply,
  ) => {
    const result = await this.checkStatusUseCase.execute({
      userId: request.body.userId,
    });

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
    const user = request.currentUser;

    const result = await this.submitApprovalUseCase.execute({
      userId: user.userId,
      ...request.body,
    });

    reply.code(HttpStatus.CREATED).send(success({
      message: "Approval submitted",
      approvalId: result.approvalId,
    }));
  };
}
