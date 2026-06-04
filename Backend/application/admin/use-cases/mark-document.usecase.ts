import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types';
import { ICompanyProfileRepository } from '../../company/ports/repository/ICompanyProfileRepository';
import { AppError } from '../../../shared/errors/AppError';
import type { IMarkCompanyDocumentInputDTO } from '../dtos/AdminCompanyMutationsDTO.js';
import type { IMarkDocumentUseCase } from '../ports/usecase/IMarkDocumentUseCase.js';

@injectable()
export class MarkDocumentUseCase implements IMarkDocumentUseCase {
  constructor(@inject(TYPES.CompanyProfileRepositoryPort) private _repo: ICompanyProfileRepository) {}

  async execute(input: IMarkCompanyDocumentInputDTO) {
    const { companyId, documentKey, verified } = input;
    const company = await this._repo.findById(companyId);

    if (!company) {
      throw AppError.notFound('Company approval not found');
    }

    company.markDocument(documentKey, verified);
    await this._repo.save(company);

    return { documentKey, marked: verified };
  }
}
