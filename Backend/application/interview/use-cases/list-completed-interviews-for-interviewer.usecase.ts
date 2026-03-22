import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { IListCompletedInterviewsForInterviewerUseCase } from '../ports/usecase/IListCompletedInterviewsForInterviewerUseCase.js';
import type {
  IListCompletedInterviewsForInterviewerInputDTO,
  IListCompletedInterviewsForInterviewerOutputDTO,
} from '../dtos/InterviewListDTO.js';

@injectable()
export class ListCompletedInterviewsForInterviewerUseCase
  implements IListCompletedInterviewsForInterviewerUseCase
{
  constructor(
    @inject(TYPES.InterviewRepositoryPort) private readonly _repo: IInterviewRepository
  ) {}

  async execute(
    input: IListCompletedInterviewsForInterviewerInputDTO
  ): Promise<IListCompletedInterviewsForInterviewerOutputDTO> {
    const { interviewerUserId, search, page, limit, sortOrder } = input;
    return this._repo.listCompletedByInterviewerUserId(interviewerUserId, {
      search,
      page,
      limit,
      sortOrder,
    });
  }
}
