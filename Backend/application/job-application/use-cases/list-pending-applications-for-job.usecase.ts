import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IApplicationRepository } from '../ports/repository/IApplicationRepository.js';
import type { ICandidateProfileRepository } from '../../candidate/ports/repository/ICandidateProfileRepository.js';
import type {
  IListPendingApplicationsForJobUseCase,
} from '../ports/usecase/IListPendingApplicationsForJobUseCase.js';
import type { IListPendingApplicationsForJobInputDTO } from '../dtos/PendingApplicationsForJobDTO.js';

@injectable()
export class ListPendingApplicationsForJobUseCase
  implements IListPendingApplicationsForJobUseCase
{
  constructor(
    @inject(TYPES.ApplicationRepositoryPort) private readonly _repo: IApplicationRepository,
    @inject(TYPES.CandidateProfileRepositoryPort) private readonly _profileRepo: ICandidateProfileRepository,
  ) {}

  async execute(input: IListPendingApplicationsForJobInputDTO) {
    const filter = input.statuses && input.statuses.length > 0 ? input.statuses : input.status;
    const [data, byStatus] = await Promise.all([
      this._repo.listByJobId(input.jobId, input.companyId, filter),
      this._repo.countByJobId(input.jobId, input.companyId),
    ]);

    // Enrich old applications that don't have educationList/workExperience
    const needsEnrichment = data.filter(
      (app) => (!app.educationList || app.educationList.length === 0) && (!app.workExperience || app.workExperience.length === 0)
    );
    if (needsEnrichment.length > 0) {
      const userIds = [...new Set(needsEnrichment.map((a) => a.candidateUserId))];
      const profiles = await Promise.all(userIds.map((uid) => this._profileRepo.findByUserId(uid)));
      const profileMap = new Map(profiles.filter(Boolean).map((p) => [p!.userId, p!]));
      for (const app of needsEnrichment) {
        const profile = profileMap.get(app.candidateUserId);
        if (profile) {
          if (!app.educationList || app.educationList.length === 0) {
            app.educationList = profile.educationList ?? [];
          }
          if (!app.workExperience || app.workExperience.length === 0) {
            app.workExperience = profile.workExperience ?? [];
          }
        }
      }
    }

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
