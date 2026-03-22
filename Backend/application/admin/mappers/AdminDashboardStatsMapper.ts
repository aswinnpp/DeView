import type { AdminDashboardTimePeriod } from '../dtos/AdminDashboardStatsDTO.js';
import type {
  IAdminDashboardStatsInputDTO,
  IAdminDashboardStatsOutputDTO,
} from '../dtos/AdminDashboardStatsDTO.js';

const ADMIN_PERIODS: readonly AdminDashboardTimePeriod[] = ['daily', 'weekly', 'monthly', 'yearly'];

export const AdminDashboardStatsMapper = {
  parsePeriodFromQuery(raw: string | undefined): AdminDashboardTimePeriod {
    if (raw && ADMIN_PERIODS.includes(raw as AdminDashboardTimePeriod)) {
      return raw as AdminDashboardTimePeriod;
    }
    return 'weekly';
  },

  toInputDTO(raw: string | undefined): IAdminDashboardStatsInputDTO {
    return { period: AdminDashboardStatsMapper.parsePeriodFromQuery(raw) };
  },

  toHttpBody(result: IAdminDashboardStatsOutputDTO): IAdminDashboardStatsOutputDTO {
    return result;
  },
};
