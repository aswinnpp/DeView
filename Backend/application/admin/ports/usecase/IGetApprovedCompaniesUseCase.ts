import type {
  IApprovedCompaniesInputDTO,
  IApprovedCompaniesOutputDTO,
} from '../../dtos/ApprovedCompaniesDTO.js';

export interface IGetApprovedCompaniesUseCase {
  execute(input: IApprovedCompaniesInputDTO): Promise<IApprovedCompaniesOutputDTO>;
}
