import type { IUpdateJobInputDTO, IUpdateJobOutputDTO } from '../../dtos/JobDTO.js';

export interface IUpdateJobUseCase {
  execute(dto: IUpdateJobInputDTO): Promise<IUpdateJobOutputDTO>;
}
