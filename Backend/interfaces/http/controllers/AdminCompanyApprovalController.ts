import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";
import { TYPES } from "../../../infrastructure/di/types";
import type { GetPendingCompaniesUseCasePort } from "../../../application/admin/ports/usecase/GetPendingCompaniesUseCasePort";
import type { ApproveCompanyUseCasePort } from "../../../application/admin/ports/usecase/ApproveCompanyUseCasePort";
import type { RejectCompanyUseCasePort } from "../../../application/admin/ports/usecase/RejectCompanyUseCasePort";
import type { MarkDocumentUseCasePort } from "../../../application/admin/ports/usecase/MarkDocumentUseCasePort";
import type { GetApprovedCompaniesUseCasePort } from "../../../application/admin/ports/usecase/GetApprovedCompaniesUseCasePort";
import type { AdminToggleActivityUseCasePort } from "../../../application/admin/ports/usecase/ToggleCompanyActiveUseCasePort";

interface RejectBody {
  reason: string;
}

interface PendingQuery {
  search?: string;
  sortOrder?: 'asc' | 'desc';
  page?: string;
  limit?: string;
}

interface SearchQuery {
  search?: string;
}

interface ApprovedQuery {
  search?: string;
  status?: string;
  sortOrder?: 'asc' | 'desc';
  page?: string;
  limit?: string;
}

@injectable()
export class AdminCompanyApprovalController {
  constructor(
    @inject(TYPES.GetPendingCompaniesUseCasePort) private readonly getPendingUseCase: GetPendingCompaniesUseCasePort,
    @inject(TYPES.ApproveCompanyUseCasePort) private readonly approveUseCase: ApproveCompanyUseCasePort,
    @inject(TYPES.RejectCompanyUseCasePort) private readonly rejectUseCase: RejectCompanyUseCasePort,
    @inject(TYPES.MarkDocumentUseCasePort) private readonly markDocumentUseCase: MarkDocumentUseCasePort,
    @inject(TYPES.GetApprovedCompaniesUseCasePort) private readonly getApprovedUseCase: GetApprovedCompaniesUseCasePort,
    @inject(TYPES.ToggleCompanyActiveUseCasePort) private readonly toggleActiveUseCase: AdminToggleActivityUseCasePort
  ) { }

  getPending = async (
    request: FastifyRequest<{ Querystring: PendingQuery }>,
    reply: FastifyReply
  ) => {
    const { search, sortOrder, page, limit } = request.query;
    const result = await this.getPendingUseCase.execute(search, sortOrder, page, limit);
    reply.status(HttpStatus.OK).send(success(result));
  };

  getApproved = async (
    request: FastifyRequest<{ Querystring: ApprovedQuery }>,
    reply: FastifyReply
  ) => {
    const { search, status, sortOrder, page, limit } = request.query;
    const result = await this.getApprovedUseCase.execute(search, status, sortOrder, page, limit);
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
    const { id } = request.params;
    const result = await this.toggleActiveUseCase.execute(id);

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
