import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import { ICompanyProfileRepository } from '../../company/ports/repository/ICompanyProfileRepository.js';
import { parseSearchParams } from '../../shared/utils/parseSearchParams.js';
import type { IPendingCompaniesInputDTO } from '../dtos/PendingCompaniesDTO.js';
import type { IGetPendingCompaniesUseCase } from '../ports/usecase/IGetPendingCompaniesUseCase.js';

@injectable()
export class GetPendingCompaniesUseCase implements IGetPendingCompaniesUseCase {
  constructor(@inject(TYPES.CompanyProfileRepositoryPort) private _repo: ICompanyProfileRepository) {}

  async execute(input: IPendingCompaniesInputDTO) {
    const { search, sortOrder, page, limit } = input;
    const { page: parsedPage, limit: parsedLimit } = parseSearchParams({ page, limit });
    return await this._repo.findPending({ search, sortOrder, page: parsedPage, limit: parsedLimit });
  }
}
