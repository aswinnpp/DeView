import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { IListMyInterviewsUseCase } from '../ports/usecase/IListMyInterviewsUseCase.js';
import type { IListMyInterviewsInputDTO, IListMyInterviewsOutputDTO } from '../dtos/InterviewListDTO.js';

@injectable()
export class ListMyInterviewsUseCase implements IListMyInterviewsUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort) private readonly _repo: IInterviewRepository
  ) {}

  async execute(input: IListMyInterviewsInputDTO): Promise<IListMyInterviewsOutputDTO> {
    const { candidateUserId, search, page, limit, sortOrder } = input;
    return this._repo.listByCandidateUserId(candidateUserId, { search, page, limit, sortOrder });
  }
}
