import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { ICompanyProfileRepository } from '../ports/repository/ICompanyProfileRepository.js';
import type { IGetCompanyLogoViewUrlUseCase } from '../ports/usecase/IGetCompanyLogoViewUrlUseCase.js';
import type { IFileStorage } from '../../upload/ports/services/IFileStorage.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { MESSAGES } from '../../../shared/constants/messages.js';

@injectable()
export class GetCompanyLogoViewUrlUseCase implements IGetCompanyLogoViewUrlUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepositoryPort)
    private readonly _repo: ICompanyProfileRepository,
    @inject(TYPES.FileStoragePort)
    private readonly _fileStorage: IFileStorage
  ) {}

  async execute(userId: string): Promise<{ url: string }> {
    const profile = await this._repo.findByUserId(userId);
    const raw = profile?.logoUrl ?? '';
    if (!raw.trim()) {
      throw AppError.notFound(MESSAGES.NOT_FOUND);
    }
    const url = await this._fileStorage.getSignedViewUrl(raw, 3600);
    return { url };
  }
}
