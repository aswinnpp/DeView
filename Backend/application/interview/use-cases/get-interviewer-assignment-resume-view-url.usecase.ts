import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { MESSAGES } from '../../../shared/constants/messages.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { IApplicationRepository } from '../../job-application/ports/repository/IApplicationRepository.js';
import type { IFileStorage } from '../../upload/ports/services/IFileStorage.js';
import type {
  IGetInterviewerAssignmentResumeViewUrlInputDTO,
  IGetInterviewerAssignmentResumeViewUrlUseCase,
} from '../ports/usecase/IGetInterviewerAssignmentResumeViewUrlUseCase.js';

@injectable()
export class GetInterviewerAssignmentResumeViewUrlUseCase
  implements IGetInterviewerAssignmentResumeViewUrlUseCase
{
  constructor(
    @inject(TYPES.InterviewRepositoryPort) private readonly _interviewRepo: IInterviewRepository,
    @inject(TYPES.ApplicationRepositoryPort)
    private readonly _applicationRepo: IApplicationRepository,
    @inject(TYPES.FileStoragePort) private readonly _fileStorage: IFileStorage
  ) {}

  async execute(input: IGetInterviewerAssignmentResumeViewUrlInputDTO): Promise<{ url: string }> {
    const { interviewId, interviewerUserId } = input;

    const interview = await this._interviewRepo.findById(interviewId);
    if (!interview) throw AppError.notFound(MESSAGES.INTERVIEW_NOT_FOUND);
    if (interview.interviewerUserId !== interviewerUserId) throw AppError.forbidden(MESSAGES.NOT_ALLOWED);

    const application = await this._applicationRepo.findByIdAndJobId(
      interview.applicationId,
      interview.jobId,
      interview.companyId
    );
    if (!application?.resumeUrl?.trim())
      throw AppError.notFound(MESSAGES.APPLICATION_OR_RESUME_NOT_FOUND);

    const url = await this._fileStorage.getSignedViewUrl(application.resumeUrl, 3600);
    return { url };
  }
}

