import type {
  ICreateHrProfileInputDTO,
  ICreateHrProfileOutputDTO,
} from "../../dtos/HrProfileDTO.js";

export interface ICreateHrProfileUseCase {
  execute(dto: ICreateHrProfileInputDTO): Promise<ICreateHrProfileOutputDTO>;
}
