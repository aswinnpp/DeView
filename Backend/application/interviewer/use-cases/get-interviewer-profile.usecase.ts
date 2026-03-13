import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/di/types";
import type { IInterviewerProfileRepository } from "../ports/repository/IInterviewerProfileRepository";
import type { IGetInterviewerProfileUseCase } from "../ports/usecase/IGetInterviewerProfileUseCase";
import type { InterviewerProfile } from "../../../domain/interviewer/entities/InterviewerProfile";
import { AppError } from "../../../shared/errors/AppError";

@injectable()
export class GetInterviewerProfileUseCase implements IGetInterviewerProfileUseCase {
  constructor(
    @inject(TYPES.InterviewerProfileRepositoryPort)
    private readonly _repo: IInterviewerProfileRepository
  ) {}

  async execute(userId: string): Promise<InterviewerProfile | null> {
    if (!userId) {
      throw AppError.badRequest("UserId is required");
    }
    const profile = await this._repo.findByUserId(userId);
    return profile ?? null;
  }
}
