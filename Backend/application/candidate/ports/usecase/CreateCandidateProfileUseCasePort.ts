import type { CreateCandidateProfileDTO } from "../../dtos/CreateCandidateProfileDTO";

export interface CreateCandidateProfileUseCasePort {
  execute(dto: CreateCandidateProfileDTO): Promise<{ message: string }>;
}
