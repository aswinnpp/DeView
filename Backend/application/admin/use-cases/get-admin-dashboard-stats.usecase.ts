import { inject, injectable } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { ICompanyProfileRepository } from '../../company/ports/repository/ICompanyProfileRepository.js';
import type { AdminDashboardTimePeriod } from '../dtos/AdminDashboardStatsDTO.js';
import type {
  IAdminDashboardStatsInputDTO,
  IAdminDashboardStatsOutputDTO,
} from '../dtos/AdminDashboardStatsDTO.js';
import type { IGetAdminDashboardStatsUseCase } from '../ports/usecase/IGetAdminDashboardStatsUseCase.js';

function utcDayStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

function addUtcDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

@injectable()
export class GetAdminDashboardStatsUseCase implements IGetAdminDashboardStatsUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepositoryPort) private readonly _companies: ICompanyProfileRepository,
  ) {}

  async execute(input: IAdminDashboardStatsInputDTO): Promise<IAdminDashboardStatsOutputDTO> {
    const { period } = input;
    const rows = await this._companies.listMinimalForAdminDashboard();

    const pending = rows.filter((r) => r.status === 'pending').length;
    const approvedCount = rows.filter((r) => r.status === 'approved').length;
    const rejected = rows.filter((r) => r.status === 'rejected').length;

    const registrationStatus = [
      { name: 'Approved', value: approvedCount },
      { name: 'Pending', value: pending },
      { name: 'Rejected', value: rejected },
    ].filter((x) => x.value > 0);

    const approvedRows = rows.filter((r) => r.status === 'approved');
    const planCounts: Record<string, number> = {};
    for (const r of approvedRows) {
      const plan =
        r.activeSubscriptionStatus === 'Active' && r.activePlanName?.trim()
          ? r.activePlanName.trim()
          : 'Free';
      planCounts[plan] = (planCounts[plan] ?? 0) + 1;
    }
    const subscriptionByPlan = Object.entries(planCounts)
      .map(([name, companies]) => ({ name, companies }))
      .sort((a, b) => b.companies - a.companies);

    const now = new Date();
    const growthData = this.buildGrowth(period, now, rows);

    return { growthData, registrationStatus, subscriptionByPlan };
  }

  private buildGrowth(
    period: AdminDashboardTimePeriod,
    now: Date,
    rows: Awaited<ReturnType<ICompanyProfileRepository['listMinimalForAdminDashboard']>>,
  ): IAdminDashboardStatsOutputDTO['growthData'] {
    const approved = rows.filter((r) => r.status === 'approved');
    const data: IAdminDashboardStatsOutputDTO['growthData'] = [];

    const countInRange = (start: Date, end: Date) =>
      approved.filter((r) => {
        const c = r.createdAt;
        return c >= start && c <= end;
      }).length;

    switch (period) {
      case 'daily': {
        for (let i = 6; i >= 0; i--) {
          const day = addUtcDays(utcDayStart(now), -i);
          const end = addUtcDays(day, 1);
          end.setUTCMilliseconds(-1);
          const label = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
          data.push({ label, count: countInRange(day, end), period: 'day' });
        }
        break;
      }
      case 'weekly': {
        const thisSunday = addUtcDays(utcDayStart(now), -utcDayStart(now).getUTCDay());
        for (let i = 3; i >= 0; i--) {
          const weekStart = addUtcDays(thisSunday, -i * 7);
          const weekEnd = addUtcDays(weekStart, 6);
          weekEnd.setUTCHours(23, 59, 59, 999);
          const label = weekStart.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC',
          });
          data.push({ label, count: countInRange(weekStart, weekEnd), period: 'week' });
        }
        break;
      }
      case 'monthly': {
        for (let i = 5; i >= 0; i--) {
          const ref = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
          const start = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), 1));
          const end = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() + 1, 0, 23, 59, 59, 999));
          const label = start.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
          data.push({ label, count: countInRange(start, end), period: 'month' });
        }
        break;
      }
      case 'yearly': {
        for (let i = 2; i >= 0; i--) {
          const y = now.getUTCFullYear() - i;
          const start = new Date(Date.UTC(y, 0, 1));
          const end = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
          data.push({ label: String(y), count: countInRange(start, end), period: 'year' });
        }
        break;
      }
      default:
        break;
    }

    return data;
  }
}
