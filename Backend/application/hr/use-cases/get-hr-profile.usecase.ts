import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/di/types";
import type { IHrProfileRepository } from "../ports/repository/IHrProfileRepository";
import type { IGetHrProfileUseCase } from "../ports/usecase/IGetHrProfileUseCase";
import { toProfileStateView, type HrProfileStateResponse } from "../mappers/HrProfileMapper";

@injectable()
export class GetHrProfileUseCase implements IGetHrProfileUseCase {
  constructor(
    @inject(TYPES.HrProfileRepositoryPort)
    private readonly _repo: IHrProfileRepository
  ) {}

  async execute(userId: string): Promise<HrProfileStateResponse> {
    const profile = await this._repo.findByUserId(userId);
    return toProfileStateView(profile);
  }
}
