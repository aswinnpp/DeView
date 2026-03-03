import type {
  IUpdateApplicationStatusInputDTO,
  IUpdateApplicationStatusResultDTO,
} from '../../dtos/UpdateApplicationStatusDTO.js';

export interface IUpdateApplicationStatusUseCase {
  execute(input: IUpdateApplicationStatusInputDTO): Promise<IUpdateApplicationStatusResultDTO>;
}

