import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IApplicationRepository } from '../ports/repository/IApplicationRepository.js';
import type {
  IListPendingApplicationsForJobUseCase,
  IListPendingApplicationsInput,
} from '../ports/usecase/IListPendingApplicationsForJobUseCase.js';

@injectable()
export class ListPendingApplicationsForJobUseCase
  implements IListPendingApplicationsForJobUseCase
{
  constructor(
    @inject(TYPES.ApplicationRepositoryPort) private readonly repo: IApplicationRepository
  ) {}

  async execute(input: IListPendingApplicationsInput) {
    const data = await this.repo.listByJobId(input.jobId, input.companyId, input.status);
    return { data };
  }
}
