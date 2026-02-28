import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IJobRepository } from '../../job/ports/repository/IJobRepository.js';
import type {
  IListAllJobsForCandidatesInput,
  IListAllJobsForCandidatesResult,
  IListAllJobsForCandidatesUseCase,
  CandidateJobForList,
} from '../ports/usecase/IListAllJobsForCandidatesUseCase.js';
import type { ICompanyProfileRepository } from '../../company/ports/repository/ICompanyProfileRepository.js';

@injectable()
export class ListAllJobsForCandidatesUseCase implements IListAllJobsForCandidatesUseCase {
  constructor(
    @inject(TYPES.JobRepositoryPort) private readonly jobRepo: IJobRepository,
    @inject(TYPES.CompanyProfileRepositoryPort) private readonly companyRepo: ICompanyProfileRepository,
  ) {}

  async execute(input: IListAllJobsForCandidatesInput): Promise<IListAllJobsForCandidatesResult> {
    // 1. Fetch jobs
    const { data: jobs, total } = await this.jobRepo.listAllPaginated({
      search: input.search,
      status: input.status === 'all' ? undefined : input.status,
      jobType: input.jobType,
      page: input.page,
      limit: input.limit,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    });

    // 2. Fetch company name for each unique company
    const companyIds = [...new Set(jobs.map((j) => j.companyId))];
    const companyNames: Record<string, { name: string; status: string; isActive: boolean }> = {};
    for (const id of companyIds) {
      const company = await this.companyRepo.findById(id);
      if (company) {
        companyNames[id] = { name: company.companyName, status: company.status, isActive: company.isActive };
      }
    }

    // 3. Add company info to each job
    const data: CandidateJobForList[] = jobs.map((job) => {
      const company = companyNames[job.companyId];
      return {
        ...job,
        companyName: company?.name,
        companyApprovalStatus: company?.status,
        companyIsActive: company?.isActive,
      };
    });

    return { data, total };
  }
}


