import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";
import { TYPES } from "../../../infrastructure/di/types";
import type { GetPendingCompaniesUseCasePort } from "../../../application/admin/ports/GetPendingCompaniesUseCasePort";
import type { ApproveCompanyUseCasePort } from "../../../application/admin/ports/ApproveCompanyUseCasePort";
import type { RejectCompanyUseCasePort } from "../../../application/admin/ports/RejectCompanyUseCasePort";
import type { MarkDocumentUseCasePort } from "../../../application/admin/ports/MarkDocumentUseCasePort";
import type { GetApprovedCompaniesUseCasePort } from "../../../application/admin/ports/GetApprovedCompaniesUseCasePort";
import type { ToggleCompanyActiveUseCasePort } from "../../../application/admin/ports/ToggleCompanyActiveUseCasePort";

interface RejectBody {
  reason: string;
}

interface SearchQuery {
  search?: string;
}

@injectable()
export class AdminCompanyApprovalController {
  constructor(
    @inject(TYPES.GetPendingCompaniesUseCasePort) private readonly getPendingUseCase: GetPendingCompaniesUseCasePort,
    @inject(TYPES.ApproveCompanyUseCasePort) private readonly approveUseCase: ApproveCompanyUseCasePort,
    @inject(TYPES.RejectCompanyUseCasePort) private readonly rejectUseCase: RejectCompanyUseCasePort,
    @inject(TYPES.MarkDocumentUseCasePort) private readonly markDocumentUseCase: MarkDocumentUseCasePort,
    @inject(TYPES.GetApprovedCompaniesUseCasePort) private readonly getApprovedUseCase: GetApprovedCompaniesUseCasePort,
    @inject(TYPES.ToggleCompanyActiveUseCasePort) private readonly toggleActiveUseCase: ToggleCompanyActiveUseCasePort
  ) { }

  getPending = async (
    request: FastifyRequest<{ Querystring: SearchQuery }>,
    reply: FastifyReply
  ) => {
    const result = await this.getPendingUseCase.execute(request.query.search);
    reply.status(HttpStatus.OK).send(success(result));
  };

  getApproved = async (
    request: FastifyRequest<{ Querystring: SearchQuery }>,
    reply: FastifyReply
  ) => {
    const result = await this.getApprovedUseCase.execute(request.query.search);
    reply.status(HttpStatus.OK).send(success(result));
  };

  approve = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    await this.approveUseCase.execute(request.params.id);

    reply.status(HttpStatus.OK).send(success({ message: "Company approved successfully" }));
  };

  reject = async (
    request: FastifyRequest<{ Params: { id: string }; Body: RejectBody }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;
    const { reason } = request.body;

    await this.rejectUseCase.execute(id, reason);

    reply.status(HttpStatus.OK).send(success({ message: "Company rejected successfully" }));
  };

  toggleActive = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const result = await this.toggleActiveUseCase.execute(request.params.id);

    reply.status(HttpStatus.OK).send(success({
      message: "Company status toggled successfully",
      isActive: result.isActive,
    }));
  };

  markDocument = async (
    request: FastifyRequest<{ Params: { id: string; key: string }; Body: { verified: boolean } }>,
    reply: FastifyReply
  ) => {
    const { id, key } = request.params;
    const { verified } = request.body;

    const result = await this.markDocumentUseCase.execute(id, key, verified);

    reply.status(HttpStatus.OK).send(success(result));
  };
}
