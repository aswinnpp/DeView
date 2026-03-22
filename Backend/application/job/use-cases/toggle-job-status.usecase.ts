import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IJobRepository } from '../ports/repository/IJobRepository.js';
import type { IToggleJobStatusUseCase } from '../ports/usecase/IToggleJobStatusUseCase.js';
import type { IToggleJobStatusInputDTO } from '../dtos/JobDTO.js';
import { AppError } from '../../../shared/errors/AppError.js';

@injectable()
export class ToggleJobStatusUseCase implements IToggleJobStatusUseCase {
  constructor(
    @inject(TYPES.JobRepositoryPort) private readonly _repo: IJobRepository,
  ) {}

  async execute(input: IToggleJobStatusInputDTO) {
    const job = await this._repo.findById(input.jobId);

    if (!job || job.companyId !== input.companyId) {
      throw AppError.notFound('Job not found');
    }

    job.toggleStatus(input.status);
    await this._repo.save(job);

    return { job };
  }
}

