import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { success } from '../../../shared/http/apiResponse.js';
import { HttpStatus } from '../../../shared/http/HttpStatus.js';
import { TYPES } from '../../../infrastructure/di/types.js';
import { AdminCompanyApprovalListMapper } from '../../../application/admin/mappers/AdminCompanyApprovalListMapper.js';
import { AdminCompanyApprovalMutationMapper } from '../../../application/admin/mappers/AdminCompanyApprovalMutationMapper.js';
import type { IGetPendingCompaniesUseCase } from '../../../application/admin/ports/usecase/IGetPendingCompaniesUseCase.js';
import type { IApproveCompanyUseCase } from '../../../application/admin/ports/usecase/IApproveCompanyUseCase.js';
import type { IRejectCompanyUseCase } from '../../../application/admin/ports/usecase/IRejectCompanyUseCase.js';
import type { IMarkDocumentUseCase } from '../../../application/admin/ports/usecase/IMarkDocumentUseCase.js';
import type { IGetApprovedCompaniesUseCase } from '../../../application/admin/ports/usecase/IGetApprovedCompaniesUseCase.js';
import type { IAdminToggleActivityUseCase } from '../../../application/admin/ports/usecase/IAdminToggleActivityUseCase.js';
import type { CompanyDocuments } from '../../../domain/entities/CompanyApprovalEntitie.js';

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
    @inject(TYPES.ToggleCompanyActiveUseCasePort) private readonly _toggleActiveUseCase: IAdminToggleActivityUseCase,
  ) {}

  getPending = async (request: FastifyRequest<{ Querystring: IPendingQuery }>, reply: FastifyReply) => {
    const input = AdminCompanyApprovalListMapper.toPendingListInput(request.query);
    const result = await this._getPendingUseCase.execute(input);
    reply.status(HttpStatus.OK).send(success(result));
  };

  getApproved = async (request: FastifyRequest<{ Querystring: IApprovedQuery }>, reply: FastifyReply) => {
    const input = AdminCompanyApprovalListMapper.toApprovedListInput(request.query);
    const result = await this._getApprovedUseCase.execute(input);
    reply.status(HttpStatus.OK).send(success(result));
  };

  approve = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const input = AdminCompanyApprovalMutationMapper.toApproveInput(request.params.id);
    await this._approveUseCase.execute(input);

    reply.status(HttpStatus.OK).send(success({ message: 'Company approved successfully' }));
  };

  reject = async (
    request: FastifyRequest<{ Params: { id: string }; Body: IRejectBody }>,
    reply: FastifyReply,
  ) => {
    const input = AdminCompanyApprovalMutationMapper.toRejectInput(request.params.id, request.body.reason);
    await this._rejectUseCase.execute(input);

    reply.status(HttpStatus.OK).send(success({ message: 'Company rejected successfully' }));
  };

  toggleActive = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const input = AdminCompanyApprovalMutationMapper.toToggleActivityInput(request.params.id);
    const result = await this._toggleActiveUseCase.execute(input);

    reply.status(HttpStatus.OK).send(
      success({
        message: 'Company status toggled successfully',
        isActive: result.isActive,
      }),
    );
  };

  markDocument = async (
    request: FastifyRequest<{ Params: { id: string; key: string }; Body: { verified: boolean } }>,
    reply: FastifyReply,
  ) => {
    const input = AdminCompanyApprovalMutationMapper.toMarkDocumentInput(
      request.params.id,
      request.params.key as keyof CompanyDocuments,
      request.body.verified,
    );

    const result = await this._markDocumentUseCase.execute(input);

    reply.status(HttpStatus.OK).send(success(result));
  };
}
