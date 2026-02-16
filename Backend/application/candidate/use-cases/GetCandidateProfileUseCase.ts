import { CandidateProfileRepository } from "../../../domain/candidate/repositories/CandidateProfileRepository";
import { CandidateProfile } from "../../../domain/candidate/entities/CandidateProfile";
import { AppError } from "../../../shared/errors/AppError";

export class GetCandidateProfileUseCase {
    constructor(private repo: CandidateProfileRepository) { }

    async execute(userId: string): Promise<CandidateProfile> {
        if (!userId) {
            throw AppError.badRequest("UserId is required");
        }

        const profile = await this.repo.findByUserId(userId);

        if (!profile) {
            throw AppError.notFound("Complete your profile to continue");
        }

        return profile;
    }
}
