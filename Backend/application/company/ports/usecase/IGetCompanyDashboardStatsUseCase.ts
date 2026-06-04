import type {
  ICompanyDashboardStatsInputDTO,
  ICompanyDashboardStatsOutputDTO,
} from '../../dtos/CompanyDashboardStatsDTO.js';

export interface IGetCompanyDashboardStatsUseCase {
  execute(input: ICompanyDashboardStatsInputDTO): Promise<ICompanyDashboardStatsOutputDTO>;
}
