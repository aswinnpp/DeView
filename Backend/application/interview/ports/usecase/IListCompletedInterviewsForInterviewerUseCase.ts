import type {
  IListCompletedInterviewsForInterviewerInputDTO,
  IListCompletedInterviewsForInterviewerOutputDTO,
} from '../../dtos/InterviewListDTO.js';

export interface IListCompletedInterviewsForInterviewerUseCase {
  execute(
    input: IListCompletedInterviewsForInterviewerInputDTO
  ): Promise<IListCompletedInterviewsForInterviewerOutputDTO>;
}
