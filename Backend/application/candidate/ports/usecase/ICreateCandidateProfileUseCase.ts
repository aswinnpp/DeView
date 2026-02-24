import type { ICreateCandidateProfileDTO } from "../../dtos/CreateCandidateProfileDTO";

export interface ICreateCandidateProfileUseCase {
  execute(dto: ICreateCandidateProfileDTO): Promise<{ message: string }>;
}
