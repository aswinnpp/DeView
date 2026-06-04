import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/di/types";
import type { IInterviewerProfileRepository } from "../ports/repository/IInterviewerProfileRepository";
import type { IGetInterviewerProfilePicViewUrlUseCase } from "../ports/usecase/IGetInterviewerProfilePicViewUrlUseCase";
import type { IFileStorage } from "../../upload/ports/services/IFileStorage.js";
import { toProfilePicStorageKey } from "../mappers/InterviewerProfileMapper";

@injectable()
export class GetInterviewerProfilePicViewUrlUseCase implements IGetInterviewerProfilePicViewUrlUseCase {
  constructor(
    @inject(TYPES.InterviewerProfileRepositoryPort)
    private readonly _repo: IInterviewerProfileRepository,
    @inject(TYPES.FileStoragePort)
    private readonly _fileStorage: IFileStorage
  ) {}

  async execute(userId: string): Promise<{ url: string }> {
    const profile = await this._repo.findByUserId(userId);
    const key = toProfilePicStorageKey(profile ?? null);
    const url = await this._fileStorage.getSignedViewUrl(key, 3600);
    return { url };
  }
}
