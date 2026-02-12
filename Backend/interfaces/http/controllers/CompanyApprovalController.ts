import { FastifyRequest, FastifyReply } from "fastify";
import { CheckCompanyStatusUseCase } from "../../../application/company/use-cases/CheckCompanyStatusUseCase";
import { SubmitCompanyApprovalUseCase } from "../../../application/company/use-cases/SubmitCompanyApprovalUseCase";
import { CompanyDocuments } from "../../../infrastructure/persistence/mongodb/schemas/CompanyApprovalDocument";
import {GetMyCompanyApprovalUseCase}  from "../../../application/company/use-cases/GetMyCompanyApprovalUseCase"

interface CheckStatusBody {
  userId: string;
}

interface SubmitApprovalBody {
  companyName: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
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
     private getMyApprovalUseCase: GetMyCompanyApprovalUseCase
  ) {}

  // POST /company/check-status
  async checkStatus(
    request: FastifyRequest<{ Body: CheckStatusBody }>,
    reply: FastifyReply
  ) {
const result = await this.checkStatusUseCase.execute({
  userId: request.body.userId,
});

    if (!result.success) {
      return reply.status(400).send({ error: result.error });
    }

    reply.status(200).send(result.data);
  }
getMyApproval = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const user = request.currentUser;

  if (!user) {
    reply.code(401).send({ error: "Unauthorized" });
    return;
  }

  const approval = await this.getMyApprovalUseCase.execute(user.userId);

  if (!approval) {
    reply.code(404).send({ error: "No approval found" });
    return;
  }

  reply.send(approval);
};


  async submit(
    request: FastifyRequest<{ Body: SubmitApprovalBody }>,
    reply: FastifyReply
  ) {
    const user = (request as any).user;

    if (!user?.userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const result = await this.submitApprovalUseCase.execute({
      userId: user.userId,
      ...request.body,
    });

    if (!result.success) {
      return reply.status(400).send({ error: result.error });
    }

    reply.status(201).send({
      message: "Approval submitted",
      approvalId: result.data,
    });
  }
}
