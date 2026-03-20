import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IApplicationRepository } from '../ports/repository/IApplicationRepository.js';
import type {
  IListPendingApplicationsForJobUseCase,
} from '../ports/usecase/IListPendingApplicationsForJobUseCase.js';
import type { IListPendingApplicationsForJobInput } from '../dtos/ListPendingApplicationsForJobDTO.js';

@injectable()
export class ListPendingApplicationsForJobUseCase
  implements IListPendingApplicationsForJobUseCase
{
  constructor(
    @inject(TYPES.ApplicationRepositoryPort) private readonly _repo: IApplicationRepository
  ) {}

  async execute(input: IListPendingApplicationsForJobInput) {
    const filter = input.statuses && input.statuses.length > 0 ? input.statuses : input.status;
    const [data, byStatus] = await Promise.all([
      this._repo.listByJobId(input.jobId, input.companyId, filter),
      this._repo.countByJobId(input.jobId, input.companyId),
    ]);

    const interviewStatuses: Array<keyof typeof byStatus> = [
      'INTERVIEW_SCHEDULED',
      'RESCHEDULE_REQUESTED',
      'INTERVIEW_COMPLETE',
      'COMPLETED',
      'HIRED',
    ];

    const counts = {
      pending: byStatus.PENDING ?? 0,
      shortlist: byStatus.SHORTLISTED ?? 0,
      interview: interviewStatuses.reduce((sum, s) => sum + (byStatus[s] ?? 0), 0),
      interview_complete: (byStatus.COMPLETED ?? 0) + (byStatus.INTERVIEW_COMPLETE ?? 0),
      complete: byStatus.REJECTED ?? 0,
    };

    return { data, counts };
  }
}
