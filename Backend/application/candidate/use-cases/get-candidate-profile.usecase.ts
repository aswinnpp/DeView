import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ICandidateProfileRepository } from "../ports/repository/ICandidateProfileRepository";
import { CandidateProfile } from "../../../domain/candidate/entities/CandidateProfile";
import { AppError } from "../../../shared/errors/AppError";
import type { IGetCandidateProfileUseCase } from "../ports/usecase/IGetCandidateProfileUseCase";

@injectable()
export class GetCandidateProfileUseCase implements IGetCandidateProfileUseCase {
    constructor(@inject(TYPES.CandidateProfileRepositoryPort) private _repo: ICandidateProfileRepository) { }

    async execute(userId: string): Promise<CandidateProfile | null> {
        if (!userId) {
            throw AppError.badRequest("UserId is required");
        }

        const profile = await this._repo.findByUserId(userId);
        return profile ?? null;
    }
}
