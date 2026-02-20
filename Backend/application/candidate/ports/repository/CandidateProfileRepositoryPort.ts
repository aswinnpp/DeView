import { CandidateProfile } from "../../../../domain/candidate/entities/CandidateProfile";

export interface CandidateProfileRepositoryPort {
  findByUserId(userId: string): Promise<CandidateProfile | null>;
  save(profile: CandidateProfile): Promise<void>;
}
