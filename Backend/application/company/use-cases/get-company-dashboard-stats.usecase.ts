import { inject, injectable } from 'inversify';
import type { ApplicationStatus } from '../../../domain/entities/Application.js';
import { TYPES } from '../../../shared/di/types.js';
import type { IApplicationRepository } from '../../job-application/ports/repository/IApplicationRepository.js';
import type { IInterviewRepository } from '../../interview/ports/repository/IInterviewRepository.js';
import type { IJobRepository } from '../../job/ports/repository/IJobRepository.js';
import type { ICompanyProfileRepository } from '../ports/repository/ICompanyProfileRepository.js';
import type {
  ICompanyDashboardStatsInputDTO,
  ICompanyDashboardStatsOutputDTO,
} from '../dtos/CompanyDashboardStatsDTO.js';
import type { IGetCompanyDashboardStatsUseCase } from '../ports/usecase/IGetCompanyDashboardStatsUseCase.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function utcDayStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

function addUtcDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

function parseScheduledDateUtc(dateStr: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr?.trim() ?? '');
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  return new Date(Date.UTC(y, mo, day));
}

function mapApplicationStatus(status: ApplicationStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Applied';
    case 'SHORTLISTED':
      return 'Shortlisted';
    case 'INTERVIEW_SCHEDULED':
    case 'INTERVIEW_COMPLETE':
    case 'RESCHEDULE_REQUESTED':
      return 'Interviewed';
    case 'HIRED':
    case 'COMPLETED':
      return 'Hired';
    case 'REJECTED':
      return 'Rejected';
    default:
      return 'Applied';
  }
}

@injectable()
export class GetCompanyDashboardStatsUseCase implements IGetCompanyDashboardStatsUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepositoryPort) private readonly _companyRepo: ICompanyProfileRepository,
    @inject(TYPES.JobRepositoryPort) private readonly _jobRepo: IJobRepository,
    @inject(TYPES.ApplicationRepositoryPort) private readonly _appRepo: IApplicationRepository,
    @inject(TYPES.InterviewRepositoryPort) private readonly _interviewRepo: IInterviewRepository,
  ) {}

  async execute(input: ICompanyDashboardStatsInputDTO): Promise<ICompanyDashboardStatsOutputDTO> {
    const { companyId } = input;
    const company = await this._companyRepo.findById(companyId);
    const companyName = company?.companyName ?? null;

    const jobs = await this._jobRepo.listByCompanyId(companyId);
    const applicationsNested = await Promise.all(
      jobs.filter((j) => j.id).map((j) => this._appRepo.listByJobId(j.id!, companyId)),
    );
    const applications = applicationsNested.flat();

    const now = new Date();
    const applicationsOverTime: ICompanyDashboardStatsOutputDTO['applicationsOverTime'] = [];
    for (let i = 6; i >= 0; i--) {
      const day = addUtcDays(utcDayStart(now), -i);
      const next = addUtcDays(day, 1);
      const count = applications.filter((a) => a.createdAt >= day && a.createdAt < next).length;
      applicationsOverTime.push({
        day: day.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
        dateLabel: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        applications: count,
      });
    }

    const statusBuckets: Record<string, number> = {};
    for (const a of applications) {
      const label = mapApplicationStatus(a.status);
      statusBuckets[label] = (statusBuckets[label] ?? 0) + 1;
    }
    const applicationStatus = Object.entries(statusBuckets).map(([name, value]) => ({ name, value }));

    const applicationsByJob = jobs
      .filter((j) => j.id)
      .map((j) => {
        const title = j.title ?? 'Untitled';
        return {
          name: title.length > 40 ? `${title.slice(0, 37)}...` : title,
          applications: applications.filter((a) => a.jobId === j.id).length,
        };
      })
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 12);

    const interviews = await this._interviewRepo.listByCompanyId(companyId);
    const year = now.getUTCFullYear();
    const monthlyCounts = new Array(12).fill(0);
    let scheduled = 0;
    let completed = 0;
    let cancelled = 0;

    const weekStart = addUtcDays(utcDayStart(now), -utcDayStart(now).getUTCDay());
    const weekEnd = addUtcDays(weekStart, 7);
    const weeklyCounts = new Array(7).fill(0);

    for (const inv of interviews) {
      const st = inv.status;
      if (st === 'CANCELLED') {
        cancelled += 1;
      } else if (st === 'COMPLETED') {
        completed += 1;
      } else {
        scheduled += 1;
      }

      const sd = parseScheduledDateUtc(inv.scheduledDate);
      if (sd) {
        if (sd.getUTCFullYear() === year) {
          monthlyCounts[sd.getUTCMonth()] += 1;
        }
        if (sd >= weekStart && sd < weekEnd) {
          weeklyCounts[sd.getUTCDay()] += 1;
        }
      }
    }

    const monthlyInterviews = MONTHS.map((month, idx) => ({
      month,
      interviews: monthlyCounts[idx] ?? 0,
    }));

    const interviewStatus = [
      { name: 'Scheduled', value: scheduled },
      { name: 'Completed', value: completed },
      { name: 'Cancelled', value: cancelled },
    ].filter((x) => x.value > 0);

    const weeklyInterviews = DAYS.map((day, idx) => ({
      day,
      interviews: weeklyCounts[idx] ?? 0,
    }));

    return {
      companyName,
      applicationsOverTime,
      applicationStatus,
      applicationsByJob,
      monthlyInterviews,
      interviewStatus,
      weeklyInterviews,
    };
  }
}
