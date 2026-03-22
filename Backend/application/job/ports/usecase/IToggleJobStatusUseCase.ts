import type { IToggleJobStatusInputDTO, IToggleJobStatusOutputDTO } from '../../dtos/JobDTO.js';

export interface IToggleJobStatusUseCase {
  execute(input: IToggleJobStatusInputDTO): Promise<IToggleJobStatusOutputDTO>;
}
