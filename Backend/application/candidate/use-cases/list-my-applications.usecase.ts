import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IApplicationRepository } from '../../application/ports/repository/IApplicationRepository.js';
import type {
  IListMyApplicationsInput,
  IListMyApplicationsResult,
  IListMyApplicationsUseCase,
} from '../ports/usecase/IListMyApplicationsUseCase.js';

@injectable()
export class ListMyApplicationsUseCase implements IListMyApplicationsUseCase {
  constructor(
    @inject(TYPES.ApplicationRepositoryPort)
    private readonly _applicationRepo: IApplicationRepository,
  ) {}

  async execute(input: IListMyApplicationsInput): Promise<IListMyApplicationsResult> {
    const { candidateUserId, status, search, page, limit, sortOrder } = input;
    const { data, total } = await this._applicationRepo.listByCandidateUserId(candidateUserId, {
      status,
      search,
      page,
      limit,
      sortOrder,
    });
    return { data, total };
  }
}

