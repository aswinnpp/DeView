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
    const data = await this._repo.listByJobId(input.jobId, input.companyId, input.status);
    return { data };
  }
}
