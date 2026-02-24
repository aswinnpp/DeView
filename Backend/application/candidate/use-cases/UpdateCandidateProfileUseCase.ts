import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ICandidateProfileRepository } from "../ports/repository/ICandidateProfileRepository";
import { IUpdateCandidateProfileDTO } from "../dtos/UpdateCandidateProfileDTO";
import { AppError } from "../../../shared/errors/AppError";
import type { IUpdateCandidateProfileUseCase } from "../ports/usecase/IUpdateCandidateProfileUseCase";

@injectable()
export class UpdateCandidateProfileUseCase implements IUpdateCandidateProfileUseCase {
    constructor(@inject(TYPES.CandidateProfileRepositoryPort) private repo: ICandidateProfileRepository) { }

    async execute(dto: IUpdateCandidateProfileDTO): Promise<{ message: string }> {
        if (!dto.userId) {
            throw AppError.badRequest("UserId is required");
        }

        const profile = await this.repo.findByUserId(dto.userId);

        if (!profile) {
            throw AppError.notFound("Complete your profile to continue");
        }

        const { userId, ...fields } = dto;
        profile.updateFields(fields);

        await this.repo.save(profile);

        return { message: "Profile updated successfully" };
    }
}
