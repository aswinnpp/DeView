import type { Job } from '../../../../domain/entities/Job.js';
import type { ICreateJobDTO } from '../../dtos/CreateJobDTO.js';

export interface ICreateJobUseCase {
  execute(dto: ICreateJobDTO): Promise<{ job: Job }>;
}

