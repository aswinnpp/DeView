import type {
  AdminDashboardTimePeriod,
  IAdminDashboardStatsInputDTO,
  IAdminDashboardStatsOutputDTO,
} from '../../dtos/AdminDashboardStatsDTO.js';

export type { AdminDashboardTimePeriod } from '../../dtos/AdminDashboardStatsDTO.js';

export interface IGetAdminDashboardStatsUseCase {
  execute(input: IAdminDashboardStatsInputDTO): Promise<IAdminDashboardStatsOutputDTO>;
}
