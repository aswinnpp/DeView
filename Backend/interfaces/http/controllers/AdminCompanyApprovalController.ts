import { FastifyRequest, FastifyReply } from "fastify";
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

export class AdminCompanyApprovalController {
  constructor(
    private readonly getPendingUseCase: GetPendingCompaniesUseCase,
    private readonly approveUseCase: ApproveCompanyUseCase,
    private readonly rejectUseCase: RejectCompanyUseCase,
    private readonly markDocumentUseCase: MarkDocumentUseCase,
    private readonly getApprovedUseCase: GetApprovedCompaniesUseCase,
    private readonly toggleActiveUseCase: ToggleCompanyActiveUseCase
  ) { }

  // GET /admin/company-requests/pending?search=...
  getPending = async (
    request: FastifyRequest<{ Querystring: SearchQuery }>,
    reply: FastifyReply
  ) => {
    const { search } = request.query;
    const companies = await this.getPendingUseCase.execute(search);

    reply.status(200).send(
      companies.map(c => ({
        id: c.id,
        userId: c.userId,
        companyName: c.companyName,
        address: c.address,
        contactPerson: c.contactPerson,
        contactEmail: c.contactEmail,
        contactPhone: c.contactPhone,
        taxId: c.taxId,
        website: c.website,
        numberOfEmployees: c.numberOfEmployees,
        documents: c.documents,
        status: c.status,
        isActive: c.isActive,
      }))
    );
  };

  // GET /admin/company-requests/approved?search=...
  getApproved = async (
    request: FastifyRequest<{ Querystring: SearchQuery }>,
    reply: FastifyReply
  ) => {
    const { search } = request.query;
    const companies = await this.getApprovedUseCase.execute(search);

    reply.status(200).send({
      approvals: companies.map(c => ({
        id: c.id,
        userId: c.userId,
        companyName: c.companyName,
        address: c.address,
        contactPerson: c.contactPerson,
        contactEmail: c.contactEmail,
        contactPhone: c.contactPhone,
        taxId: c.taxId,
        website: c.website,
        numberOfEmployees: c.numberOfEmployees,
        documents: c.documents,
        status: c.status,
        isActive: c.isActive,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }))
    });
  };

  // POST /admin/company-requests/:id/approve
  approve = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    await this.approveUseCase.execute(request.params.id);

    reply.status(200).send({
      message: "Company approved successfully",
    });
  };

  // POST /admin/company-requests/:id/reject
  reject = async (
    request: FastifyRequest<{ Params: { id: string }; Body: RejectBody }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;
    const { reason } = request.body;

    await this.rejectUseCase.execute(id, reason);

    reply.status(200).send({
      message: "Company rejected successfully",
    });
  };

  // POST /admin/company-requests/:id/toggle-active
  toggleActive = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const result = await this.toggleActiveUseCase.execute(request.params.id);

    reply.status(200).send({
      message: "Company status toggled successfully",
      isActive: result.isActive,
    });
  };

  // PATCH /admin/company-requests/:id/documents/:key/mark
  markDocument = async (
    request: FastifyRequest<{ Params: { id: string; key: string }; Body: { verified: boolean } }>,
    reply: FastifyReply
  ) => {
    const { id, key } = request.params;
    const { verified } = request.body;

    const result = await this.markDocumentUseCase.execute(id, key, verified);

    reply.status(200).send(result);
  };
}
