import type {
  IToggleCompanyActivityInputDTO,
  IToggleCompanyActivityOutputDTO,
} from '../../dtos/AdminCompanyMutationsDTO.js';

export interface IAdminToggleActivityUseCase {
  execute(input: IToggleCompanyActivityInputDTO): Promise<IToggleCompanyActivityOutputDTO>;
}
