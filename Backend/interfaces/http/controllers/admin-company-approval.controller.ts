import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from "fastify";
import { success } from "../../../shared/http/apiResponse";
import { HttpStatus } from "../../../shared/http/HttpStatus";
import { TYPES } from "../../../infrastructure/di/types";
import type { IGetPendingCompaniesUseCase } from "../../../application/admin/ports/usecase/IGetPendingCompaniesUseCase";
import type { IApproveCompanyUseCase } from "../../../application/admin/ports/usecase/IApproveCompanyUseCase";
import type { IRejectCompanyUseCase } from "../../../application/admin/ports/usecase/IRejectCompanyUseCase";
import type { IMarkDocumentUseCase } from "../../../application/admin/ports/usecase/IMarkDocumentUseCase";
import type { IGetApprovedCompaniesUseCase } from "../../../application/admin/ports/usecase/IGetApprovedCompaniesUseCase";
import type { IAdminToggleActivityUseCase } from "../../../application/admin/ports/usecase/IAdminToggleActivityUseCase";

interface IRejectBody {
  reason: string;
}

interface IPendingQuery {
  search?: string;
  sortOrder?: 'asc' | 'desc';
  page?: string;
  limit?: string;
}


interface IApprovedQuery {
  search?: string;
  status?: string;
  sortOrder?: 'asc' | 'desc';
  page?: string;
  limit?: string;
}

@injectable()
export class AdminCompanyApprovalController {
  constructor(
    @inject(TYPES.GetPendingCompaniesUseCasePort) private readonly _getPendingUseCase: IGetPendingCompaniesUseCase,
    @inject(TYPES.ApproveCompanyUseCasePort) private readonly _approveUseCase: IApproveCompanyUseCase,
    @inject(TYPES.RejectCompanyUseCasePort) private readonly _rejectUseCase: IRejectCompanyUseCase,
    @inject(TYPES.MarkDocumentUseCasePort) private readonly _markDocumentUseCase: IMarkDocumentUseCase,
    @inject(TYPES.GetApprovedCompaniesUseCasePort) private readonly _getApprovedUseCase: IGetApprovedCompaniesUseCase,
    @inject(TYPES.ToggleCompanyActiveUseCasePort) private readonly _toggleActiveUseCase: IAdminToggleActivityUseCase
  ) { }

  getPending = async (
    request: FastifyRequest<{ Querystring: IPendingQuery }>,
    reply: FastifyReply
  ) => {
    const { search, sortOrder, page, limit } = request.query;
    const result = await this._getPendingUseCase.execute(search, sortOrder, page, limit);
    reply.status(HttpStatus.OK).send(success(result));
  };

  getApproved = async (
    request: FastifyRequest<{ Querystring: IApprovedQuery }>,
    reply: FastifyReply
  ) => {
    const { search, status, sortOrder, page, limit } = request.query;
    const result = await this._getApprovedUseCase.execute(search, status, sortOrder, page, limit);
    reply.status(HttpStatus.OK).send(success(result));
  };

  approve = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    await this._approveUseCase.execute(request.params.id);

    reply.status(HttpStatus.OK).send(success({ message: "Company approved successfully" }));
  };

  reject = async (
    request: FastifyRequest<{ Params: { id: string }; Body: IRejectBody }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;
    const { reason } = request.body;

    await this._rejectUseCase.execute(id, reason);

    reply.status(HttpStatus.OK).send(success({ message: "Company rejected successfully" }));
  };

  toggleActive = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;
    const result = await this._toggleActiveUseCase.execute(id);

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

    const result = await this._markDocumentUseCase.execute(id, key as Parameters<IMarkDocumentUseCase["execute"]>[1], verified);

    reply.status(HttpStatus.OK).send(success(result));
  };
}
