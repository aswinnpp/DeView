import { FastifyRequest, FastifyReply } from "fastify";
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

export class CompanyApprovalController {
  constructor(
    private readonly checkStatusUseCase: CheckCompanyStatusUseCase,
    private readonly submitApprovalUseCase: SubmitCompanyApprovalUseCase,
    private readonly getMyApprovalUseCase: GetMyCompanyApprovalUseCase,
  ) {}

  // POST /company/check-status
  checkStatus = async (
    request: FastifyRequest<{ Body: CheckStatusBody }>,
    reply: FastifyReply,
  ) => {
    const result = await this.checkStatusUseCase.execute({
      userId: request.body.userId,
    });

    reply.send(result);
  };

  getMyApproval = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.currentUser;

    const approval = await this.getMyApprovalUseCase.execute(user.userId);

    reply.send(approval);
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

    reply.code(201).send({
      message: "Approval submitted",
      approvalId: result.approvalId,
    });
  };
}
