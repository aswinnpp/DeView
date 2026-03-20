import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ICandidateProfileRepository } from "../ports/repository/ICandidateProfileRepository";
import { CandidateProfile } from "../../../domain/entities/CandidateProfile";
import { ICreateCandidateProfileDTO } from "../dtos/CreateCandidateProfileDTO";
import { AppError } from "../../../shared/errors/AppError";
import type { ICreateCandidateProfileUseCase } from "../ports/usecase/ICreateCandidateProfileUseCase";

@injectable()
export class CreateCandidateProfileUseCase implements ICreateCandidateProfileUseCase {
    constructor(@inject(TYPES.CandidateProfileRepositoryPort) private _repo: ICandidateProfileRepository) { }

    async execute(dto: ICreateCandidateProfileDTO): Promise<{ message: string }> {
        if (!dto.userId) {
            throw AppError.badRequest("UserId is required");
        }

        const existing = await this._repo.findByUserId(dto.userId);
        if (existing) {
            throw AppError.conflict("Candidate profile already exists");
        }

        const profile = new CandidateProfile(
            null,
            dto.userId,
            dto.fullName,
            dto.email,
            dto.phone,
            dto.location,
            dto.dateOfBirth,
            dto.title,
            dto.currentCompany,
            dto.currentSalary,
            dto.experience,
            dto.bio,
            dto.expectedSalary,
            dto.noticePeriod,
            dto.preferredWorkMode,
            dto.preferredJobType,
            dto.willingToRelocate ?? false,
            dto.skills ?? [],
            dto.languages ?? [],
            dto.education,
            dto.university,
            dto.graduationYear,
            dto.linkedinUrl,
            dto.githubUrl,
            dto.resumeUrl,
            dto.profilePicUrl
        );

        await this._repo.save(profile);

        return { message: "Profile created successfully" };
    }
}
