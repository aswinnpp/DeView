import type { CandidateProfile } from "../../../../domain/entities/CandidateProfile";

export interface IGetCandidateProfileUseCase {
  execute(userId: string): Promise<CandidateProfile | null>;
}
