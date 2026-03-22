import type {
  ISubmitCompanyApprovalInputDTO,
  ISubmitCompanyApprovalOutputDTO,
} from '../../dtos/CompanyApprovalDTO.js';

export interface ISubmitCompanyApprovalUseCase {
  execute(dto: ISubmitCompanyApprovalInputDTO): Promise<ISubmitCompanyApprovalOutputDTO>;
}
