import type {
  ICreateInterviewerProfileInputDTO,
  ICreateInterviewerProfileOutputDTO,
} from '../../dtos/InterviewerProfileDTO.js';

export interface ICreateInterviewerProfileUseCase {
  execute(dto: ICreateInterviewerProfileInputDTO): Promise<ICreateInterviewerProfileOutputDTO>;
}
