import type {
  IListMyInterviewFeedbacksInputDTO,
  IListMyInterviewFeedbacksOutputDTO,
} from '../../dtos/InterviewListDTO.js';

export interface IListMyInterviewFeedbacksUseCase {
  execute(input: IListMyInterviewFeedbacksInputDTO): Promise<IListMyInterviewFeedbacksOutputDTO>;
}
