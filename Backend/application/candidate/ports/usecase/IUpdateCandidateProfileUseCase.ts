import type { IUpdateCandidateProfileDTO } from "../../dtos/UpdateCandidateProfileDTO";

export interface IUpdateCandidateProfileUseCase {
  execute(dto: IUpdateCandidateProfileDTO): Promise<{ message: string }>;
}
