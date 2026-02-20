import type { UpdateCandidateProfileDTO } from "../../dtos/UpdateCandidateProfileDTO";

export interface UpdateCandidateProfileUseCasePort {
  execute(dto: UpdateCandidateProfileDTO): Promise<{ message: string }>;
}
