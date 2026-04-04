import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/di/types";
import type { IHrProfileRepository } from "../ports/repository/IHrProfileRepository";
import type { IUpdateHrProfileUseCase } from "../ports/usecase/IUpdateHrProfileUseCase";
import type { IUpdateHrProfileInputDTO } from "../dtos/HrProfileDTO.js";
import { AppError } from "../../../shared/errors/AppError";

@injectable()
export class UpdateHrProfileUseCase implements IUpdateHrProfileUseCase {
  constructor(
    @inject(TYPES.HrProfileRepositoryPort)
    private readonly _repo: IHrProfileRepository
  ) {}

  async execute(dto: IUpdateHrProfileInputDTO): Promise<{ message: string }> {
    if (!dto.userId) {
      throw AppError.badRequest("UserId is required");
    }
    const profile = await this._repo.findByUserId(dto.userId);
    if (!profile) {
      throw AppError.notFound("HR profile not found");
    }
    const { userId: _u, ...fields } = dto;
    profile.updateFields(fields);
    await this._repo.save(profile);
    return { message: "Profile updated successfully" };
  }
}
