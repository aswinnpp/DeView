import type {
  IRejectCompanyInputDTO,
  IRejectCompanyOutputDTO,
} from '../../dtos/AdminCompanyMutationsDTO.js';

export interface IRejectCompanyUseCase {
  execute(input: IRejectCompanyInputDTO): Promise<IRejectCompanyOutputDTO>;
}
