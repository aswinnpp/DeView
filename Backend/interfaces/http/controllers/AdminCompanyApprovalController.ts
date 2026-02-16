import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";
import { GetPendingCompaniesUseCase } from "../../../application/admin/use-cases/GetPendingCompaniesUseCase";
import { ApproveCompanyUseCase } from "../../../application/admin/use-cases/ApproveCompanyUseCase";
import { RejectCompanyUseCase } from "../../../application/admin/use-cases/RejectCompanyUseCase";
import { MarkDocumentUseCase } from "../../../application/admin/use-cases/MarkDocumentUseCase";
import { GetApprovedCompaniesUseCase } from "../../../application/admin/use-cases/GetApprovedCompaniesUseCase";
import { ToggleCompanyActiveUseCase } from "../../../application/admin/use-cases/ToggleCompanyActiveUseCase";

interface RejectBody {
  reason: string;
}

interface SearchQuery {
  search?: string;
}

@injectable()
export class AdminCompanyApprovalController {
  constructor(
    @inject(GetPendingCompaniesUseCase) private readonly getPendingUseCase: GetPendingCompaniesUseCase,
    @inject(ApproveCompanyUseCase) private readonly approveUseCase: ApproveCompanyUseCase,
    @inject(RejectCompanyUseCase) private readonly rejectUseCase: RejectCompanyUseCase,
    @inject(MarkDocumentUseCase) private readonly markDocumentUseCase: MarkDocumentUseCase,
    @inject(GetApprovedCompaniesUseCase) private readonly getApprovedUseCase: GetApprovedCompaniesUseCase,
    @inject(ToggleCompanyActiveUseCase) private readonly toggleActiveUseCase: ToggleCompanyActiveUseCase
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

  // POST /admin/company-requests/:id/approve
  approve = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    await this.approveUseCase.execute(request.params.id);

    reply.status(HttpStatus.OK).send(success({ message: "Company approved successfully" }));
  };

  // POST /admin/company-requests/:id/reject
  reject = async (
    request: FastifyRequest<{ Params: { id: string }; Body: RejectBody }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;
    const { reason } = request.body;

    await this.rejectUseCase.execute(id, reason);

    reply.status(HttpStatus.OK).send(success({ message: "Company rejected successfully" }));
  };

  // POST /admin/company-requests/:id/toggle-active
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

  // PATCH /admin/company-requests/:id/documents/:key/mark
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
