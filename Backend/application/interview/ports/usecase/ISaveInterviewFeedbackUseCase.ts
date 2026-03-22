import type {
  ISaveInterviewFeedbackInputDTO,
  ISaveInterviewFeedbackOutputDTO,
} from '../../dtos/InterviewCommandDTO.js';

export interface ISaveInterviewFeedbackUseCase {
  execute(input: ISaveInterviewFeedbackInputDTO): Promise<ISaveInterviewFeedbackOutputDTO>;
}
