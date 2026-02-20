import type { CheckCompanyStatusDTO } from "../../dtos/CheckCompanyStatusDTO";

export interface CheckCompanyStatusUseCasePort {
  execute(dto: CheckCompanyStatusDTO): Promise<{
    status: string;
    rejectionReason?: string | null;
  }>;
}
