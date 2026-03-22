import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IApplicationRepository } from '../ports/repository/IApplicationRepository.js';
import type { IRejectionMailRepository } from '../ports/repository/IRejectionMailRepository.js';
import type {
  IUpdateApplicationStatusUseCase,
} from '../ports/usecase/IUpdateApplicationStatusUseCase.js';
import type {
  IUpdateApplicationStatusInputDTO,
  IUpdateApplicationStatusOutputDTO,
} from '../dtos/ApplicationStatusDTO.js';
import { AppError } from '../../../shared/errors/AppError.js';

@injectable()
export class UpdateApplicationStatusUseCase implements IUpdateApplicationStatusUseCase {
  constructor(
    @inject(TYPES.ApplicationRepositoryPort)
    private readonly _applicationRepository: IApplicationRepository,
    @inject(TYPES.RejectionMailRepositoryPort)
    private readonly _rejectionMailRepository: IRejectionMailRepository
  ) {}

  async execute(input: IUpdateApplicationStatusInputDTO): Promise<IUpdateApplicationStatusOutputDTO> {
    const updated = await this._applicationRepository.updateStatus(input);

    if (!updated) {
      throw AppError.notFound('Application not found');
    }

    if (updated.status === 'REJECTED' && input.rejectionEmailContent && input.rejectionEmailContent.trim().length > 0) {
      await this._rejectionMailRepository.create({
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

