import type {
  ICheckCompanyStatusInputDTO,
  ICheckCompanyStatusOutputDTO,
} from '../../dtos/CompanyApprovalDTO.js';

export interface ICheckCompanyStatusUseCase {
  execute(dto: ICheckCompanyStatusInputDTO): Promise<ICheckCompanyStatusOutputDTO>;
}
