import { AppError } from '../../../shared/errors/AppError.js';
import type { ICompanyDashboardStatsInputDTO } from '../dtos/CompanyDashboardStatsDTO.js';

export const CompanyDashboardStatsMapper = {
  requireCompanyIdFromUser(user: { companyId?: string }): string {
    const id = user.companyId?.trim();
    if (!id) {
      throw AppError.forbidden('Company access required');
    }
    return id;
  },

  toInputDTO(user: { companyId?: string }): ICompanyDashboardStatsInputDTO {
    return { companyId: CompanyDashboardStatsMapper.requireCompanyIdFromUser(user) };
  },
};
