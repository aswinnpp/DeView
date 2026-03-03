import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IApplicationRepository } from '../ports/repository/IApplicationRepository.js';
import type { IRejectionMailRepository } from '../ports/repository/IRejectionMailRepository.js';
import type {
  IUpdateApplicationStatusUseCase,
} from '../ports/usecase/IUpdateApplicationStatusUseCase.js';
import type {
  IUpdateApplicationStatusInputDTO,
  IUpdateApplicationStatusResultDTO,
} from '../dtos/UpdateApplicationStatusDTO.js';
import { AppError } from '../../../shared/errors/AppError.js';

@injectable()
export class UpdateApplicationStatusUseCase implements IUpdateApplicationStatusUseCase {
  constructor(
    @inject(TYPES.ApplicationRepositoryPort)
    private readonly applicationRepository: IApplicationRepository,
    @inject(TYPES.RejectionMailRepositoryPort)
    private readonly rejectionMailRepository: IRejectionMailRepository
  ) {}

  async execute(input: IUpdateApplicationStatusInputDTO): Promise<IUpdateApplicationStatusResultDTO> {
    const updated = await this.applicationRepository.updateStatus(input);

    if (!updated) {
      throw AppError.notFound('Application not found');
    }

    // If this is a rejection with email content, also store it in the separate rejection mail collection
    if (updated.status === 'REJECTED' && input.rejectionEmailContent && input.rejectionEmailContent.trim().length > 0) {
      await this.rejectionMailRepository.create({
        applicationId: updated.id || input.applicationId,
        jobId: updated.jobId,
        companyId: updated.companyId,
        candidateUserId: updated.candidateUserId,
        candidateName: updated.fullName,
        candidateEmail: updated.email,
        content: input.rejectionEmailContent,
      });
    }

    return { application: updated };
  }
}

