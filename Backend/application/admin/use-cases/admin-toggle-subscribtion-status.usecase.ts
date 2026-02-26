import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/di/types";
import { AppError } from "../../../shared/errors/AppError";
import type { IAdminToggleSubscribtionStatusUsecase } from "../ports/usecase/IAdmin-ToggleSubscribtionStatusUsecase";
import type { ISubscribtionRepository } from "../ports/repository/ISubscribtionRepository";

@injectable()
export class AdminToggleSubscribtionStatusUsecase
  implements IAdminToggleSubscribtionStatusUsecase
{
  constructor(
    @inject(TYPES.SubscribtionRepositoryPort)
    private readonly repo: ISubscribtionRepository
  ) {}

  async execute(id: string): Promise<{ isActive: boolean }> {
    const plan = await this.repo.findById(id);
    if (!plan) {
      throw AppError.notFound("Subscription plan not found");
    }

    plan.isActive = !plan.isActive;
    await this.repo.save(plan);

    return { isActive: plan.isActive };
  }
}

