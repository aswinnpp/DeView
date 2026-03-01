import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/di/types";
import { AppError } from "../../../shared/errors/AppError";
import type { IAdminToggleSubscriptionStatusUsecase } from "../ports/usecase/IAdmin-ToggleSubscriptionStatusUsecase";
import type { ISubscriptionRepository } from "../ports/repository/ISubscriptionRepository";

@injectable()
export class AdminToggleSubscriptionStatusUsecase
  implements IAdminToggleSubscriptionStatusUsecase
{
  constructor(
    @inject(TYPES.SubscriptionRepositoryPort)
    private readonly repo: ISubscriptionRepository
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
