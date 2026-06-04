import type {
  IRegisterUserInputDTO,
  IRegisterUserOutputDTO,
} from '../../dtos/RegisterDTO.js';

export interface IRegisterUserUseCase {
  execute(dto: IRegisterUserInputDTO): Promise<IRegisterUserOutputDTO>;
}
