import { CandidateProfile } from "../entities/CandidateProfile";

export interface CandidateProfileRepository {
    findByUserId(userId: string): Promise<CandidateProfile | null>;
    save(profile: CandidateProfile): Promise<void>;
}
