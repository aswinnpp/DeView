import type {
  IUpdateCompanyProfileInputDTO,
  IUpdateCompanyProfileOutputDTO,
} from '../../dtos/CompanyProfileDTO.js';

export interface IUpdateCompanyProfileUseCase {
  execute(dto: IUpdateCompanyProfileInputDTO): Promise<IUpdateCompanyProfileOutputDTO>;
}
