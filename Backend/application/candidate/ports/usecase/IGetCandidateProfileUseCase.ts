import type { CandidateProfile } from "../../../../domain/candidate/entities/CandidateProfile";

export interface IGetCandidateProfileUseCase {
  execute(userId: string): Promise<CandidateProfile | null>;
}
