import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { CompanyApprovalRepositoryPort } from "../ports/CompanyApprovalRepositoryPort";
import { UpdateCompanyProfileDTO } from "../dtos/UpdateCompanyProfileDTO";
import { AppError } from "../../../shared/errors/AppError";
import type { UpdateCompanyProfileUseCasePort } from "../ports/UpdateCompanyProfileUseCasePort";

@injectable()
export class UpdateCompanyProfileUseCase implements UpdateCompanyProfileUseCasePort {
    constructor(@inject(TYPES.CompanyApprovalRepositoryPort) private repo: CompanyApprovalRepositoryPort) { }

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
