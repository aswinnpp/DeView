import type {
  IUpdateInterviewStatusInputDTO,
  IUpdateInterviewStatusOutputDTO,
} from '../../dtos/InterviewCommandDTO.js';

export interface IUpdateInterviewStatusUseCase {
  execute(input: IUpdateInterviewStatusInputDTO): Promise<IUpdateInterviewStatusOutputDTO>;
}
