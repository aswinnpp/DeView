import { injectable, inject } from 'inversify';
import { TYPES } from "../../../infrastructure/di/types";
import { CandidateProfileRepository } from "../../../domain/candidate/repositories/CandidateProfileRepository";
import { CandidateProfile } from "../../../domain/candidate/entities/CandidateProfile";
import { AppError } from "../../../shared/errors/AppError";

@injectable()
export class GetCandidateProfileUseCase {
    constructor(@inject(TYPES.CandidateProfileRepository) private repo: CandidateProfileRepository) { }

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
