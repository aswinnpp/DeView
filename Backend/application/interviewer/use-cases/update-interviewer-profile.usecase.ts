import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/di/types";
import type { IInterviewerProfileRepository } from "../ports/repository/IInterviewerProfileRepository";
import type { IUpdateInterviewerProfileUseCase } from "../ports/usecase/IUpdateInterviewerProfileUseCase";
import type { UpdateInterviewerProfileDTO } from "../dtos/UpdateInterviewerProfileDTO";
import { AppError } from "../../../shared/errors/AppError";

@injectable()
export class UpdateInterviewerProfileUseCase implements IUpdateInterviewerProfileUseCase {
  constructor(
    @inject(TYPES.InterviewerProfileRepositoryPort)
    private repo: IInterviewerProfileRepository
  ) {}

  async execute(dto: UpdateInterviewerProfileDTO): Promise<{ message: string }> {
    if (!dto.userId) {
      throw AppError.badRequest("UserId is required");
    }
    const profile = await this.repo.findByUserId(dto.userId);
    if (!profile) {
      throw AppError.notFound("Interviewer profile not found");
    }
    const { userId: _u, ...fields } = dto;
    profile.updateFields(fields);
    await this.repo.save(profile);
    return { message: "Profile updated successfully" };
  }
}
