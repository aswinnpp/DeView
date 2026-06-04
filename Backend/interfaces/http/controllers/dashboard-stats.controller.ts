import { inject, injectable } from 'inversify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../../shared/http/apiResponse.js';
import { TYPES } from '../../../infrastructure/di/types.js';
import { AdminDashboardStatsMapper } from '../../../application/admin/mappers/AdminDashboardStatsMapper.js';
import { CompanyDashboardStatsMapper } from '../../../application/company/mappers/CompanyDashboardStatsMapper.js';
import type { IGetAdminDashboardStatsUseCase } from '../../../application/admin/ports/usecase/IGetAdminDashboardStatsUseCase.js';
import type { IGetCompanyDashboardStatsUseCase } from '../../../application/company/ports/usecase/IGetCompanyDashboardStatsUseCase.js';

@injectable()
export class DashboardStatsController {
  constructor(
    @inject(TYPES.GetAdminDashboardStatsUseCasePort)
    private readonly _adminDashboardStats: IGetAdminDashboardStatsUseCase,
    @inject(TYPES.GetCompanyDashboardStatsUseCasePort)
    private readonly _companyDashboardStats: IGetCompanyDashboardStatsUseCase,
  ) {}

  getAdminDashboardStats = async (
    request: FastifyRequest<{ Querystring: { period?: string } }>,
    reply: FastifyReply,
  ) => {
    const input = AdminDashboardStatsMapper.toInputDTO(request.query?.period);
    const result = await this._adminDashboardStats.execute(input);
    reply.send(success(result));
  };

  getCompanyDashboardStats = async (request: FastifyRequest, reply: FastifyReply) => {
    const input = CompanyDashboardStatsMapper.toInputDTO(request.currentUser);
    const result = await this._companyDashboardStats.execute(input);
    reply.send(success(result));
  };
}
