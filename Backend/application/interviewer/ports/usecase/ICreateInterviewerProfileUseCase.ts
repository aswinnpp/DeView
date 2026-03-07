import type { CreateInterviewerProfileDTO } from "../../dtos/CreateInterviewerProfileDTO";

export interface ICreateInterviewerProfileUseCase {
  execute(dto: CreateInterviewerProfileDTO): Promise<{ message: string }>;
}
