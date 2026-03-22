import type { ICreateJobInputDTO, ICreateJobOutputDTO } from '../../dtos/JobDTO.js';

export interface ICreateJobUseCase {
  execute(dto: ICreateJobInputDTO): Promise<ICreateJobOutputDTO>;
}
