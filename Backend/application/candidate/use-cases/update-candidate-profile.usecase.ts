import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ICandidateProfileRepository } from "../ports/repository/ICandidateProfileRepository";
import type { IUpdateCandidateProfileInputDTO } from '../dtos/CandidateProfileDTO.js';
import { AppError } from "../../../shared/errors/AppError";
import type { IUpdateCandidateProfileUseCase } from "../ports/usecase/IUpdateCandidateProfileUseCase";

@injectable()
export class UpdateCandidateProfileUseCase implements IUpdateCandidateProfileUseCase {
    constructor(@inject(TYPES.CandidateProfileRepositoryPort) private _repo: ICandidateProfileRepository) { }

    async execute(dto: IUpdateCandidateProfileInputDTO): Promise<{ message: string }> {
        if (!dto.userId) {
            throw AppError.badRequest("UserId is required");
        }

        const profile = await this._repo.findByUserId(dto.userId);

        if (!profile) {
            throw AppError.notFound("Complete your profile to continue");
        }

        const {  ...fields } = dto;
        profile.updateFields(fields);

        await this._repo.save(profile);

        return { message: "Profile updated successfully" };
    }
}
