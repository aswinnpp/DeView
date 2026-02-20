import type { CandidateProfile } from "../../../domain/candidate/entities/CandidateProfile";

export interface GetCandidateProfileUseCasePort {
  execute(userId: string): Promise<CandidateProfile | null>;
}
