import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/di/types";
import type { IInterviewerProfileRepository } from "../ports/repository/IInterviewerProfileRepository";
import type { IGetInterviewerProfileUseCase } from "../ports/usecase/IGetInterviewerProfileUseCase";
import { AppError } from "../../../shared/errors/AppError";
import {
  toProfileStateView,
  type InterviewerProfileStateResponse,
} from "../mappers/InterviewerProfileMapper";

@injectable()
export class GetInterviewerProfileUseCase implements IGetInterviewerProfileUseCase {
  constructor(
    @inject(TYPES.InterviewerProfileRepositoryPort)
    private readonly _repo: IInterviewerProfileRepository
  ) {}

  async execute(userId: string): Promise<InterviewerProfileStateResponse> {
    if (!userId) {
      throw AppError.badRequest("UserId is required");
    }
    const profile = await this._repo.findByUserId(userId);
    return toProfileStateView(profile ?? null);
  }
}
