import type {
  IApproveCompanyInputDTO,
  IApproveCompanyOutputDTO,
} from '../../dtos/AdminCompanyMutationsDTO.js';

export interface IApproveCompanyUseCase {
  execute(input: IApproveCompanyInputDTO): Promise<IApproveCompanyOutputDTO>;
}
