import { CandidateProfile } from "../../../../domain/entities/CandidateProfile";

export interface ICandidateProfileRepository {
  findByUserId(userId: string): Promise<CandidateProfile | null>;
  save(profile: CandidateProfile): Promise<void>;
}
