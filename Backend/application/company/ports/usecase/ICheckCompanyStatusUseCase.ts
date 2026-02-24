import type { ICheckCompanyStatusDTO } from "../../dtos/CheckCompanyStatusDTO";

export interface ICheckCompanyStatusUseCase {
  execute(dto: ICheckCompanyStatusDTO): Promise<{
    status: string;
    rejectionReason?: string | null;
  }>;
}
