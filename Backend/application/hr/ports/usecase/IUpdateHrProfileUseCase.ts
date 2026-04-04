import type {
  IUpdateHrProfileInputDTO,
  IUpdateHrProfileOutputDTO,
} from "../../dtos/HrProfileDTO.js";

export interface IUpdateHrProfileUseCase {
  execute(dto: IUpdateHrProfileInputDTO): Promise<IUpdateHrProfileOutputDTO>;
}
