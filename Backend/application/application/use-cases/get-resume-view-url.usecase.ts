import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IApplicationRepository } from '../ports/repository/IApplicationRepository.js';
import type { IFileStorage } from '../../upload/ports/services/IFileStorage.js';
import { AppError } from '../../../shared/errors/AppError.js';

export interface IGetResumeViewUrlInput {
  companyId: string;
  jobId: string;
  applicationId: string;
}

export interface IGetResumeViewUrlUseCase {
  execute(input: IGetResumeViewUrlInput): Promise<{ url: string }>;
}

@injectable()
export class GetResumeViewUrlUseCase implements IGetResumeViewUrlUseCase {
  constructor(
    @inject(TYPES.ApplicationRepositoryPort)
    private readonly applicationRepository: IApplicationRepository,
    @inject(TYPES.FileStoragePort)
    private readonly fileStorage: IFileStorage
  ) {}

  async execute(input: IGetResumeViewUrlInput): Promise<{ url: string }> {
    const { companyId, jobId, applicationId } = input;

    const application = await this.applicationRepository.findByIdAndJobId(
      applicationId,
      jobId,
      companyId
    );

    if (!application?.resumeUrl?.trim()) {
      throw AppError.notFound('Application or resume not found');
    }

    const url = await this.fileStorage.getSignedViewUrl(application.resumeUrl, 3600);
    return { url };
  }
}
