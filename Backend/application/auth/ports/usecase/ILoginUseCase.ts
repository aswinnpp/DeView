import type { ILoginInputDTO, ILoginOutputDTO } from '../../dtos/LoginDTO.js';

export interface ILoginUseCase {
  execute(input: ILoginInputDTO): Promise<ILoginOutputDTO>;
}
