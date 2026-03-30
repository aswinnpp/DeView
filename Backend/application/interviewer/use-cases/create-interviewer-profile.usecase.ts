import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/di/types";
import type { IInterviewerProfileRepository } from "../ports/repository/IInterviewerProfileRepository";
import type { ICreateInterviewerProfileUseCase } from "../ports/usecase/ICreateInterviewerProfileUseCase";
import type { ICreateInterviewerProfileInputDTO } from "../dtos/InterviewerProfileDTO.js";
import { InterviewerProfile } from "../../../domain/entities/InterviewerProfile";
import { AppError } from "../../../shared/errors/AppError";

@injectable()
export class CreateInterviewerProfileUseCase implements ICreateInterviewerProfileUseCase {
  constructor(
    @inject(TYPES.InterviewerProfileRepositoryPort)
    private readonly _repo: IInterviewerProfileRepository
  ) {}

  async execute(dto: ICreateInterviewerProfileInputDTO): Promise<{ message: string }> {
    if (!dto.userId) {
      throw AppError.badRequest("UserId is required");
    }
    const existing = await this._repo.findByUserId(dto.userId);
    if (existing) {
      throw AppError.conflict("Interviewer profile already exists");
    }

    const educationList = dto.educationList ?? [];
    const workExperience = dto.workExperience ?? [];

    const currentCompany = dto.currentCompany ?? workExperience[0]?.company ?? "";
    const yearsOfExperience =
      dto.yearsOfExperience ??
      workExperience.reduce((sum, w) => sum + (Number.isFinite(w.years) ? w.years : 0), 0);
    const education = dto.education ?? educationList[0]?.degree ?? "";
    const university = dto.university ?? educationList[0]?.university ?? "";

    const profile = new InterviewerProfile(
      null,
      dto.userId,
      dto.fullName,
      dto.phone ?? "",
      dto.location ?? "",
      dto.title,
      currentCompany,
      dto.yearsOfExperience ?? yearsOfExperience,
      dto.bio,
      dto.technicalSkills ?? [],
      dto.languages ?? [],
      education,
      university ?? "",
      educationList,
      workExperience,
      dto.linkedinUrl ?? "",
      dto.githubUrl ?? "",
      dto.profilePicUrl ?? ""
    );
    await this._repo.save(profile);
    return { message: "Profile created successfully" };
  }
}
