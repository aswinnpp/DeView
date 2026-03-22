import type {
  IPendingCompaniesInputDTO,
  IPendingCompaniesOutputDTO,
} from '../../dtos/PendingCompaniesDTO.js';

export interface IGetPendingCompaniesUseCase {
  execute(input: IPendingCompaniesInputDTO): Promise<IPendingCompaniesOutputDTO>;
}
