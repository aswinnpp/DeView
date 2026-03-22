import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewFeedbackRepository } from '../ports/repository/IInterviewFeedbackRepository.js';
import type { IListMyInterviewFeedbacksUseCase } from '../ports/usecase/IListMyInterviewFeedbacksUseCase.js';
import type {
  ICandidateInterviewHistoryItemDTO,
  IListMyInterviewFeedbacksInputDTO,
  IListMyInterviewFeedbacksOutputDTO,
} from '../dtos/InterviewListDTO.js';

@injectable()
export class ListMyInterviewFeedbacksUseCase implements IListMyInterviewFeedbacksUseCase {
  constructor(
    @inject(TYPES.InterviewFeedbackRepositoryPort)
    private readonly _feedbackRepo: IInterviewFeedbackRepository
  ) {}

  async execute(input: IListMyInterviewFeedbacksInputDTO): Promise<IListMyInterviewFeedbacksOutputDTO> {
    const { candidateUserId, search, page, limit, sortOrder } = input;
    const { data: feedbacks, total } = await this._feedbackRepo.listByCandidateUserId(candidateUserId, {
      search,
      page,
      limit,
      sortOrder,
    });

    const items: ICandidateInterviewHistoryItemDTO[] = feedbacks.map((fb) => ({
      id: fb.id ?? fb.interviewId,
      interviewId: fb.interviewId,
      companyName: fb.companyName,
      interviewerName: fb.interviewerName,
      jobId: fb.jobId,
      round: fb.round,
      feedback: fb.feedback,
      totalScore: fb.totalScore,
      createdAt: fb.createdAt.toISOString(),
    }));

    return { data: items, total };
  }
}
