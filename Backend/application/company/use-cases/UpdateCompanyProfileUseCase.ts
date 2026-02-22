import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CompanyProfileRepositoryPort } from "../ports/repository/CompanyProfileRepositoryPort";
import { UpdateCompanyProfileDTO } from "../dtos/UpdateCompanyProfileDTO";
import { AppError } from "../../../shared/errors/AppError";
import type { UpdateCompanyProfileUseCasePort } from "../ports/usecase/UpdateCompanyProfileUseCasePort";

@injectable()
export class UpdateCompanyProfileUseCase implements UpdateCompanyProfileUseCasePort {
    constructor(@inject(TYPES.CompanyProfileRepositoryPort) private repo: CompanyProfileRepositoryPort) { }

    async execute(dto: UpdateCompanyProfileDTO): Promise<{ message: string }> {
        if (!dto.userId) {
            throw AppError.badRequest("UserId is required");
        }

        const profile = await this.repo.findByUserId(dto.userId);

        if (!profile) {
            throw AppError.notFound("Company profile not found");
        }

        // Exclude documents and other protected fields from update
        const { userId, ...fields } = dto;
        profile.updateFields(fields);

        await this.repo.save(profile);

        return { message: "Profile updated successfully" };
    }
}
