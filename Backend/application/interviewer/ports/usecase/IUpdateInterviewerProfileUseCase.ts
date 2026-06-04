import type {
  IUpdateInterviewerProfileInputDTO,
  IUpdateInterviewerProfileOutputDTO,
} from '../../dtos/InterviewerProfileDTO.js';

export interface IUpdateInterviewerProfileUseCase {
  execute(dto: IUpdateInterviewerProfileInputDTO): Promise<IUpdateInterviewerProfileOutputDTO>;
}
