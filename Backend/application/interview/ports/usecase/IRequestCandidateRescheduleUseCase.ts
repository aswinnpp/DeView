import type {
  IRequestCandidateRescheduleInputDTO,
  IRequestCandidateRescheduleOutputDTO,
} from '../../dtos/InterviewCommandDTO.js';

export interface IRequestCandidateRescheduleUseCase {
  execute(input: IRequestCandidateRescheduleInputDTO): Promise<IRequestCandidateRescheduleOutputDTO>;
}
