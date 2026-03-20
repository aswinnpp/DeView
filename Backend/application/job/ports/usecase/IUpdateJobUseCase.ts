import type { Job } from '../../../../domain/entities/Job.js';
import type { IUpdateJobDTO } from '../../dtos/UpdateJobDTO.js';

export interface IUpdateJobUseCase {
  execute(dto: IUpdateJobDTO): Promise<{ job: Job }>;
}

