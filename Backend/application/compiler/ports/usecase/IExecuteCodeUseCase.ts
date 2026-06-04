import type { IExecuteCodeInputDTO, IExecuteCodeOutputDTO } from '../../dtos/CompilerDTO.js';

export interface IExecuteCodeUseCase {
  execute(input: IExecuteCodeInputDTO): Promise<IExecuteCodeOutputDTO>;
}
