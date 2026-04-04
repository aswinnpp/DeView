import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/di/types";
import type { IHrProfileRepository } from "../ports/repository/IHrProfileRepository";
import type { IGetHrProfileUseCase } from "../ports/usecase/IGetHrProfileUseCase";
import type { HrProfile } from "../../../domain/entities/HrProfile";

@injectable()
export class GetHrProfileUseCase implements IGetHrProfileUseCase {
  constructor(
    @inject(TYPES.HrProfileRepositoryPort)
    private readonly _repo: IHrProfileRepository
  ) {}

  async execute(userId: string): Promise<HrProfile | null> {
    return this._repo.findByUserId(userId);
  }
}
