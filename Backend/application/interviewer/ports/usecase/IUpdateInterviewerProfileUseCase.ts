import type { UpdateInterviewerProfileDTO } from "../../dtos/UpdateInterviewerProfileDTO";

export interface IUpdateInterviewerProfileUseCase {
  execute(dto: UpdateInterviewerProfileDTO): Promise<{ message: string }>;
}
