import type {
  IPrecheckScheduleInterviewInputDTO,
  IPrecheckScheduleInterviewOutputDTO,
} from '../../dtos/PrecheckScheduleInterviewDTO.js';

export interface IPrecheckScheduleInterviewUseCase {
  execute(input: IPrecheckScheduleInterviewInputDTO): Promise<IPrecheckScheduleInterviewOutputDTO>;
}
