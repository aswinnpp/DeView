import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CandidateProfileRepositoryPort } from "../ports/CandidateProfileRepositoryPort";
import { CandidateProfile } from "../../../domain/candidate/entities/CandidateProfile";
import { AppError } from "../../../shared/errors/AppError";
import type { GetCandidateProfileUseCasePort } from "../ports/GetCandidateProfileUseCasePort";

@injectable()
export class GetCandidateProfileUseCase implements GetCandidateProfileUseCasePort {
    constructor(@inject(TYPES.CandidateProfileRepositoryPort) private repo: CandidateProfileRepositoryPort) { }

    async execute(userId: string): Promise<CandidateProfile | null> {
        if (!userId) {
            throw AppError.badRequest("UserId is required");
        }

        const profile = await this.repo.findByUserId(userId);
        return profile ?? null;
    }
}
