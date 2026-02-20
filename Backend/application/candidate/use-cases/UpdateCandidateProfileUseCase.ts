import { injectable, inject } from 'inversify';
import { TYPES } from "../../../infrastructure/di/types";
import { CandidateProfileRepositoryPort } from "../ports/CandidateProfileRepositoryPort";
import { UpdateCandidateProfileDTO } from "../dtos/UpdateCandidateProfileDTO";
import { AppError } from "../../../shared/errors/AppError";
import type { UpdateCandidateProfileUseCasePort } from "../ports/UpdateCandidateProfileUseCasePort";

@injectable()
export class UpdateCandidateProfileUseCase implements UpdateCandidateProfileUseCasePort {
    constructor(@inject(TYPES.CandidateProfileRepositoryPort) private repo: CandidateProfileRepositoryPort) { }

    async execute(dto: UpdateCandidateProfileDTO): Promise<{ message: string }> {
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
