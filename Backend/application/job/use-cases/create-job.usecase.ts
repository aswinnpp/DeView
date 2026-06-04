import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IJobRepository } from '../ports/repository/IJobRepository.js';
import type { ICreateJobInputDTO } from '../dtos/JobDTO.js';
import type { ICreateJobUseCase } from '../ports/usecase/ICreateJobUseCase.js';
import type { ICompanyProfileRepository } from '../../company/ports/repository/ICompanyProfileRepository.js';
import { Job } from '../../../domain/entities/Job.js';
import { AppError } from '../../../shared/errors/AppError.js';
import type { IUserRepository } from '../../shared/ports/repository/IUserRepository.js';
import type { INotificationRepository } from '../../notification/ports/repository/INotificationRepository.js';
import type { INotificationPublisher } from '../../notification/ports/service/INotificationPublisher.js';


@injectable()
export class CreateJobUseCase implements ICreateJobUseCase {
  constructor(
    @inject(TYPES.JobRepositoryPort) private readonly _repo: IJobRepository,
    @inject(TYPES.CompanyProfileRepositoryPort) private readonly _companyRepo: ICompanyProfileRepository,
    @inject(TYPES.UserRepositoryPort) private readonly _userRepo: IUserRepository,
    @inject(TYPES.NotificationRepositoryPort) private readonly _notificationRepo: INotificationRepository,
    @inject(TYPES.NotificationPublisherPort) private readonly _notificationPublisher: INotificationPublisher,
  ) {}

  async execute(dto: ICreateJobInputDTO) {
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

    //
      const candidateIds = await this._userRepo.listActiveUserIdsByRole('candidate');
      await Promise.all(
        candidateIds.map(async (candidateUserId) => {
          const notification = await this._notificationRepo.create({
            recipientType: 'USER',
            recipientId: candidateUserId,
            type: 'NEW_JOB',
            title: 'New job posted',
            message: `A new job has been posted: ${job.title}`,
            data: { jobId: job.id, companyId: dto.companyId },
          });
          await this._notificationPublisher.publish({
            recipientType: 'USER',
            recipientId: candidateUserId,
            notification,
          });
        }),
      );
   

    return { job };
  }
}

