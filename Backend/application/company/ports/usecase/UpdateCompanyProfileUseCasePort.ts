import type { UpdateCompanyProfileDTO } from "../../dtos/UpdateCompanyProfileDTO";

export interface UpdateCompanyProfileUseCasePort {
  execute(dto: UpdateCompanyProfileDTO): Promise<{ message: string }>;
}
