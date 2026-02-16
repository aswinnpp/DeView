import { CandidateProfileRepository } from "../../../domain/candidate/repositories/CandidateProfileRepository";
import { UpdateCandidateProfileDTO } from "../dtos/UpdateCandidateProfileDTO";
import { AppError } from "../../../shared/errors/AppError";

export class UpdateCandidateProfileUseCase {
    constructor(private repo: CandidateProfileRepository) { }

    async execute(dto: UpdateCandidateProfileDTO): Promise<{ message: string }> {
        if (!dto.userId) {
            throw AppError.badRequest("UserId is required");
        }

        const profile = await this.repo.findByUserId(dto.userId);

        if (!profile) {
            throw AppError.notFound("Complete your profile to continue");
        }

        // Extract userId from the dto, pass the rest to updateFields
        const { userId, ...fields } = dto;
        profile.updateFields(fields);

        await this.repo.save(profile);

        return { message: "Profile updated successfully" };
    }
}
