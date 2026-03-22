import type {
  IUpdateApplicationStatusInputDTO,
  IUpdateApplicationStatusOutputDTO,
} from '../../dtos/ApplicationStatusDTO.js';

export interface IUpdateApplicationStatusUseCase {
  execute(input: IUpdateApplicationStatusInputDTO): Promise<IUpdateApplicationStatusOutputDTO>;
}
