import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IJobRepository } from '../ports/repository/IJobRepository.js';
import type { ICreateJobDTO } from '../dtos/CreateJobDTO.js';
import type { ICreateJobUseCase } from '../ports/usecase/ICreateJobUseCase.js';
import type { ICompanyProfileRepository } from '../../company/ports/repository/ICompanyProfileRepository.js';
import { Job } from '../../../domain/job/entities/Job.js';
import { AppError } from '../../../shared/errors/AppError.js';


@injectable()
export class CreateJobUseCase implements ICreateJobUseCase {
  constructor(
    @inject(TYPES.JobRepositoryPort) private readonly _repo: IJobRepository,
    @inject(TYPES.CompanyProfileRepositoryPort) private readonly _companyRepo: ICompanyProfileRepository,
  ) {}

  async execute(dto: ICreateJobDTO) {
    const now = new Date();

    const company = await this._companyRepo.findById(dto.companyId);

    if (!company) {
      throw AppError.forbidden('Company profile not found. Please complete your company profile before posting jobs.');
    }

   

    const job = new Job(
      null,
      dto.companyId,
      dto.title,
      dto.department,
      dto.location,
      dto.jobType,
      dto.workMode,
      dto.experienceLevel,
      dto.minExperience,
      dto.maxExperience,
      dto.salary,
      dto.salaryNonDisclosure ?? false,
      dto.skills,
      dto.qualifications,
      dto.responsibilities,
      dto.benefits,
      dto.description,
      dto.applicationDeadline,
      typeof dto.numberOfPositions === 'number'
        ? dto.numberOfPositions
        : Number(dto.numberOfPositions ?? 1),
      dto.interviewRounds,
      dto.status ?? 'OPEN',
      [],
      now,
      now,
    );

    await this._repo.save(job);

    return { job };
  }
}

