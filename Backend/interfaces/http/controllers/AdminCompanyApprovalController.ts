import { FastifyRequest, FastifyReply } from "fastify";
import { GetPendingCompaniesUseCase } from "../../../application/admin/use-cases/GetPendingCompaniesUseCase";
import { ApproveCompanyUseCase } from "../../../application/admin/use-cases/ApproveCompanyUseCase";
import { RejectCompanyUseCase } from "../../../application/admin/use-cases/RejectCompanyUseCase";

interface RejectBody {
  reason: string;
}

/**
 * Admin controller for company approval requests.
 * All routes require admin role.
 */
export class AdminCompanyApprovalController {
  constructor(
    private readonly getPendingUseCase: GetPendingCompaniesUseCase,
    private readonly approveUseCase: ApproveCompanyUseCase,
    private readonly rejectUseCase: RejectCompanyUseCase
  ) {
    this.getPending = this.getPending.bind(this);
    this.approve = this.approve.bind(this);
    this.reject = this.reject.bind(this);
  }

  // GET /admin/company-requests
  async getPending(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const companies = await this.getPendingUseCase.execute();

    reply.status(200).send(
      companies.map((c) => ({
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
        
      }))
    );
  }

  // POST /admin/company-requests/:id/approve
  async approve(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    await this.approveUseCase.execute(request.params.id);
    reply.status(200).send({ message: "Company approved successfully" });
  }

  // POST /admin/company-requests/:id/reject
  async reject(
    request: FastifyRequest<{ Params: { id: string }; Body: RejectBody }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;
    const { reason } = request.body ?? {};

    await this.rejectUseCase.execute(id, reason ?? "");

    reply.status(200).send({ message: "Company rejected successfully" });
  }
}
