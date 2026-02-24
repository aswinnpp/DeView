import type { IUpdateCompanyProfileDTO } from "../../dtos/UpdateCompanyProfileDTO";

export interface IUpdateCompanyProfileUseCase {
  execute(dto: IUpdateCompanyProfileDTO): Promise<{ message: string }>;
}
