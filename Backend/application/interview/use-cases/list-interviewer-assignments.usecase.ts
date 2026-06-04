import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { IListInterviewerAssignmentsUseCase } from '../ports/usecase/IListInterviewerAssignmentsUseCase.js';
import type {
  IListInterviewerAssignmentsInputDTO,
  IListInterviewerAssignmentsOutputDTO,
} from '../dtos/InterviewListDTO.js';

@injectable()
export class ListInterviewerAssignmentsUseCase implements IListInterviewerAssignmentsUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort) private readonly _repo: IInterviewRepository
  ) {}

  async execute(input: IListInterviewerAssignmentsInputDTO): Promise<IListInterviewerAssignmentsOutputDTO> {
    const { interviewerUserId, search, page, limit, sortOrder, acceptedOnly } = input;
    return this._repo.listByInterviewerUserId(interviewerUserId, {
      search,
      page,
      limit,
      sortOrder,
      acceptedOnly,
    });
  }
}
