import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { ICompanyProfileRepository } from "../ports/repository/ICompanyProfileRepository";
import { AppError } from "../../../shared/errors/AppError";
import type {
  IGetCompanyProfileUseCase,
  IGetCompanyProfileInputDTO,
} from "../ports/usecase/IGetCompanyProfileUseCase";
import { CompanyProfileMapper } from "../mappers/CompanyProfileMapper.js";
import type { ISubscriptionRepository } from "../../admin/ports/repository/ISubscriptionRepository.js";

@injectable()
export class GetCompanyProfileUseCase implements IGetCompanyProfileUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepositoryPort) private _repo: ICompanyProfileRepository,
    @inject(TYPES.SubscriptionRepositoryPort) private _subscriptionRepo: ISubscriptionRepository,
    
  ) {}

  async execute(input: IGetCompanyProfileInputDTO) {
    const { userId, page, limit } = input;
    if (!userId) {
      throw AppError.badRequest("UserId is required");
    }

    const profile = await this._repo.findByUserId(userId);

    if (!profile) {
      throw AppError.notFound("Company profile not found");
    }

    const now = new Date();

    // Backfill plan details and embedded limits when missing (legacy records)
    if (profile.activeSubscription && (
      !profile.activeSubscription.planName ||
      profile.activeSubscription.price === 0 ||
      profile.activeSubscription.interviewLimit === undefined
    )) {
      const plan = await this._subscriptionRepo.findById(profile.activeSubscription.planId);
      if (plan) {
        profile.activeSubscription.planName = plan.name;
        profile.activeSubscription.price = plan.price;
        profile.activeSubscription.duration = plan.duration;
        profile.activeSubscription.interviewLimit = plan.interviewLimit;
        profile.activeSubscription.interviewUnlimited = plan.interviewUnlimited;
        profile.activeSubscription.jobPostLimit = plan.jobPostLimit;
        profile.activeSubscription.jobUnlimited = plan.jobUnlimited;
      }
    }

    // Refresh subscription state (expiry promotion, etc.)
    profile.refreshSubscriptions(now);
    await this._repo.save(profile);

    return CompanyProfileMapper.toProfileResponse(profile, { page, limit });
  }
}
