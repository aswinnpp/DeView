import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/di/types";
import type { IHrProfileRepository } from "../ports/repository/IHrProfileRepository";
import type { IGetHrProfilePicViewUrlUseCase } from "../ports/usecase/IGetHrProfilePicViewUrlUseCase";
import type { IFileStorage } from "../../upload/ports/services/IFileStorage.js";
import { toProfilePicStorageKey } from "../mappers/HrProfileMapper";

@injectable()
export class GetHrProfilePicViewUrlUseCase implements IGetHrProfilePicViewUrlUseCase {
  constructor(
    @inject(TYPES.HrProfileRepositoryPort)
    private readonly _repo: IHrProfileRepository,
    @inject(TYPES.FileStoragePort)
    private readonly _fileStorage: IFileStorage
  ) {}

  async execute(userId: string): Promise<{ url: string }> {
    const profile = await this._repo.findByUserId(userId);
    const key = toProfilePicStorageKey(profile);
    const url = await this._fileStorage.getSignedViewUrl(key, 3600);
    return { url };
  }
}
