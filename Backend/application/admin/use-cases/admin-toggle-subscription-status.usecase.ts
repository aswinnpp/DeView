import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types';
import { AppError } from '../../../shared/errors/AppError';
import type { IAdminToggleSubscriptionStatusUsecase } from '../ports/usecase/IAdmin-ToggleSubscriptionStatusUsecase';
import type { ISubscriptionRepository } from '../ports/repository/ISubscriptionRepository';
import type { ISubscriptionToggleStatusInputDTO } from '../dtos/SubscriptionToggleStatusDTO.js';

@injectable()
export class AdminToggleSubscriptionStatusUsecase implements IAdminToggleSubscriptionStatusUsecase {
  constructor(
    @inject(TYPES.SubscriptionRepositoryPort)
    private readonly _repo: ISubscriptionRepository,
  ) {}

  async execute(input: ISubscriptionToggleStatusInputDTO) {
    const { id } = input;
    const plan = await this._repo.findById(id);
    if (!plan) {
      throw AppError.notFound('Subscription plan not found');
    }

    plan.isActive = !plan.isActive;
    await this._repo.save(plan);

    return { isActive: plan.isActive };
  }
}
