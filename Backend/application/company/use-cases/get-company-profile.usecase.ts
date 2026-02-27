import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ICompanyProfileRepository } from "../ports/repository/ICompanyProfileRepository";
import { AppError } from "../../../shared/errors/AppError";
import type { IGetCompanyProfileUseCase } from "../ports/usecase/IGetCompanyProfileUseCase";
import type { ISubscribtionRepository } from "../../admin/ports/repository/ISubscribtionRepository.js";

@injectable()
export class GetCompanyProfileUseCase implements IGetCompanyProfileUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepositoryPort) private repo: ICompanyProfileRepository,
    @inject(TYPES.SubscribtionRepositoryPort) private subscriptionRepo: ISubscribtionRepository,
  ) {}

  async execute(userId: string) {
    if (!userId) {
      throw AppError.badRequest("UserId is required");
    }

    const profile = await this.repo.findByUserId(userId);

    if (!profile) {
      throw AppError.notFound("Company profile not found");
    }

    const now = new Date();

    // Enrich legacy subscription fields into the new embedded record
    if (!profile.activeSubscription && profile.subscriptionPlanId && profile.subscriptionEndsAt) {
      const plan = await this.subscriptionRepo.findById(profile.subscriptionPlanId);
      if (plan) {
        profile.activeSubscription = {
          id: crypto.randomUUID(),
          planId: plan.id ?? profile.subscriptionPlanId,
          planName: plan.name,
          price: plan.price,
          duration: plan.duration,
          startAt: now,
          endsAt: profile.subscriptionEndsAt,
          status: "Active",
          createdAt: now,
        };
      }
    }

    if (profile.activeSubscription && (!profile.activeSubscription.planName || profile.activeSubscription.price === 0)) {
      const plan = await this.subscriptionRepo.findById(profile.activeSubscription.planId);
      if (plan) {
        profile.activeSubscription.planName = plan.name;
        profile.activeSubscription.price = plan.price;
        profile.activeSubscription.duration = plan.duration;
      }
    }

    // Lazy refresh subscription state (expiry promotion, etc.)
    profile.refreshSubscriptions(now);
    await this.repo.save(profile);

    return profile;
  }
}
