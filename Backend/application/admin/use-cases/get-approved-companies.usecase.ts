import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import { ICompanyProfileRepository } from '../../company/ports/repository/ICompanyProfileRepository.js';
import { parseSearchParams } from '../../shared/utils/parseSearchParams.js';
import type { IApprovedCompaniesInputDTO } from '../dtos/ApprovedCompaniesDTO.js';
import type { IGetApprovedCompaniesUseCase } from '../ports/usecase/IGetApprovedCompaniesUseCase.js';

@injectable()
export class GetApprovedCompaniesUseCase implements IGetApprovedCompaniesUseCase {
  constructor(@inject(TYPES.CompanyProfileRepositoryPort) private _repo: ICompanyProfileRepository) {}

  async execute(input: IApprovedCompaniesInputDTO) {
    const { search, status, sortOrder, page, limit } = input;
    const { page: parsedPage, limit: parsedLimit } = parseSearchParams({ page, limit });
    const { data, total } = await this._repo.findApproved({
      search,
      status: status as 'active' | 'inactive' | undefined,
      sortOrder,
      page: parsedPage,
      limit: parsedLimit,
    });
    return { approvals: data, total };
  }
}
