import type { IListJobsInputDTO, IListJobsOutputDTO } from '../../dtos/JobDTO.js';

export interface IListJobsUseCase {
  execute(input: IListJobsInputDTO): Promise<IListJobsOutputDTO>;
}
