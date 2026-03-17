import type {
  IPrecheckScheduleInterviewInput,
} from '../../use-cases/precheck-schedule-interview.usecase.js';

export interface IPrecheckScheduleInterviewUseCase {
  execute(input: IPrecheckScheduleInterviewInput): Promise<{ ok: true }>;
}

