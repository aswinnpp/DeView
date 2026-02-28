import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IJobRepository } from '../ports/repository/IJobRepository.js';
import type { IUpdateJobUseCase } from '../ports/usecase/IUpdateJobUseCase.js';
import type { IUpdateJobDTO } from '../dtos/UpdateJobDTO.js';
import { AppError } from '../../../shared/errors/AppError.js';

@injectable()
export class UpdateJobUseCase implements IUpdateJobUseCase {
  constructor(
    @inject(TYPES.JobRepositoryPort) private readonly repo: IJobRepository,
  ) {}

  async execute(dto: IUpdateJobDTO) {
    const job = await this.repo.findById(dto.jobId);

    if (!job || job.companyId !== dto.companyId) {
      throw AppError.notFound('Job not found');
    }

    job.updateFields(dto.data);
    await this.repo.save(job);

    return { job };
  }
}

