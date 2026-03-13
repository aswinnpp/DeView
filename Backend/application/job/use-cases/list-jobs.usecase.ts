import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IJobRepository } from '../ports/repository/IJobRepository.js';
import type { IListJobsInput, IListJobsUseCase } from '../ports/usecase/IListJobsUseCase.js';

@injectable()
export class ListJobsUseCase implements IListJobsUseCase {
  constructor(
    @inject(TYPES.JobRepositoryPort) private readonly _repo: IJobRepository,
  ) {}

  async execute(input: IListJobsInput) {
    return this._repo.listByCompanyIdPaginated(input.companyId, {
      search: input.search,
      status: input.status,
      page: input.page,
      limit: input.limit,
    });
  }
}

