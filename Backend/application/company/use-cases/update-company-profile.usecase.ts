import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ICompanyProfileRepository } from "../ports/repository/ICompanyProfileRepository";
import { IUpdateCompanyProfileDTO } from "../dtos/UpdateCompanyProfileDTO";
import { AppError } from "../../../shared/errors/AppError";
import type { IUpdateCompanyProfileUseCase } from "../ports/usecase/IUpdateCompanyProfileUseCase";

@injectable()
export class UpdateCompanyProfileUseCase implements IUpdateCompanyProfileUseCase {
    constructor(@inject(TYPES.CompanyProfileRepositoryPort) private repo: ICompanyProfileRepository) { }

    async execute(dto: IUpdateCompanyProfileDTO): Promise<{ message: string }> {
        if (!dto.userId) {
            throw AppError.badRequest("UserId is required");
        }

        const profile = await this.repo.findByUserId(dto.userId);

        if (!profile) {
            throw AppError.notFound("Company profile not found");
        }

        const {  ...fields } = dto;
        profile.updateFields(fields);

        await this.repo.save(profile);

        return { message: "Profile updated successfully" };
    }
}
