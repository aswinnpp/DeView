import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/di/types";
import type { IInterviewerProfileRepository } from "../ports/repository/IInterviewerProfileRepository";
import type { ICreateInterviewerProfileUseCase } from "../ports/usecase/ICreateInterviewerProfileUseCase";
import type { CreateInterviewerProfileDTO } from "../dtos/CreateInterviewerProfileDTO";
import { InterviewerProfile } from "../../../domain/entities/InterviewerProfile";
import { AppError } from "../../../shared/errors/AppError";

@injectable()
export class CreateInterviewerProfileUseCase implements ICreateInterviewerProfileUseCase {
  constructor(
    @inject(TYPES.InterviewerProfileRepositoryPort)
    private readonly _repo: IInterviewerProfileRepository
  ) {}

  async execute(dto: CreateInterviewerProfileDTO): Promise<{ message: string }> {
    if (!dto.userId) {
      throw AppError.badRequest("UserId is required");
    }
    const existing = await this._repo.findByUserId(dto.userId);
    if (existing) {
      throw AppError.conflict("Interviewer profile already exists");
    }
    const profile = new InterviewerProfile(
      null,
      dto.userId,
      dto.fullName,
      dto.phone ?? "",
      dto.location ?? "",
      dto.title,
      dto.currentCompany ?? "",
      dto.yearsOfExperience,
      dto.bio,
      dto.technicalSkills ?? [],
      dto.languages ?? [],
      dto.education,
      dto.university ?? "",
      dto.linkedinUrl ?? "",
      dto.githubUrl ?? ""
    );
    await this._repo.save(profile);
    return { message: "Profile created successfully" };
  }
}
