import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IJobRepository } from '../ports/repository/IJobRepository.js';
import type { IListJobsInput, IListJobsUseCase } from '../ports/usecase/IListJobsUseCase.js';

@injectable()
export class ListJobsUseCase implements IListJobsUseCase {
  constructor(
    @inject(TYPES.JobRepositoryPort) private readonly repo: IJobRepository,
  ) {}

  async execute(input: IListJobsInput) {
    const base = await this.repo.listByCompanyId(input.companyId);

    const search = input.search?.trim().toLowerCase();
    const status = input.status;

    return base.filter((job) => {
      if (status && job.status !== status) return false;

      if (search) {
        const q = search;
        const inTitle = job.title?.toLowerCase().includes(q) ?? false;

        if (!inTitle) {
          return false;
        }
      }

      return true;
    });
  }
}

