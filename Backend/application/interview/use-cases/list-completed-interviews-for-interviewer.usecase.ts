import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { IInterviewFeedbackRepository } from '../ports/repository/IInterviewFeedbackRepository.js';
import { InterviewMapper } from '../mappers/InterviewMapper.js';
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
    @inject(TYPES.InterviewRepositoryPort) private readonly _repo: IInterviewRepository,
    @inject(TYPES.InterviewFeedbackRepositoryPort)
    private readonly _feedbackRepo: IInterviewFeedbackRepository
  ) {}

  async execute(
    input: IListCompletedInterviewsForInterviewerInputDTO
  ): Promise<IListCompletedInterviewsForInterviewerOutputDTO> {
    const { interviewerUserId, search, page, limit, sortOrder } = input;
    const { data, total } = await this._repo.listCompletedByInterviewerUserId(interviewerUserId, {
      search,
      page,
      limit,
      sortOrder,
    });

    const enriched = await Promise.all(
      data.map(async (interview) => {
        const id = interview.id;
        const latest = id ? await this._feedbackRepo.findLatestByInterviewId(id) : null;
        return InterviewMapper.toCompletedInterviewerListItemDTO(interview, latest);
      })
    );

    return { data: enriched, total };
  }
}
