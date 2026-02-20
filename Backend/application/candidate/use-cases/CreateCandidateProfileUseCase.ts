import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CandidateProfileRepositoryPort } from "../ports/CandidateProfileRepositoryPort";
import { CandidateProfile } from "../../../domain/candidate/entities/CandidateProfile";
import { CreateCandidateProfileDTO } from "../dtos/CreateCandidateProfileDTO";
import { AppError } from "../../../shared/errors/AppError";
import type { CreateCandidateProfileUseCasePort } from "../ports/CreateCandidateProfileUseCasePort";

@injectable()
export class CreateCandidateProfileUseCase implements CreateCandidateProfileUseCasePort {
    constructor(@inject(TYPES.CandidateProfileRepositoryPort) private repo: CandidateProfileRepositoryPort) { }

    async execute(dto: CreateCandidateProfileDTO): Promise<{ message: string }> {
        if (!dto.userId) {
            throw AppError.badRequest("UserId is required");
        }

        // Prevent duplicate profiles
        const existing = await this.repo.findByUserId(dto.userId);
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
            dto.resumeUrl
        );

        await this.repo.save(profile);

        return { message: "Profile created successfully" };
    }
}
