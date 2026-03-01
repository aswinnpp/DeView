import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/di/types";
import type {
  IAdminUpdateSubscriptionUsecase,
  IUpdateSubscriptionInput,
} from "../ports/usecase/IAdmin-UpdateSubscriptionUsecase";
import type { ISubscriptionRepository } from "../ports/repository/ISubscriptionRepository";
import { AppError } from "../../../shared/errors/AppError";

@injectable()
export class AdminUpdateSubscription
  implements IAdminUpdateSubscriptionUsecase
{
  constructor(
    @inject(TYPES.SubscriptionRepositoryPort)
    private readonly subscriptionRepository: ISubscriptionRepository
  ) {}

  async execute(id: string, input: IUpdateSubscriptionInput): Promise<void> {
    const existing = await this.subscriptionRepository.findById(id);
    if (!existing) {
      throw AppError.notFound("Subscription plan not found");
    }

    if (typeof input.name !== "string" || !input.name.trim()) {
      throw AppError.badRequest("name is required");
    }
    const name = input.name.trim();

    if (typeof input.price !== "number" || Number.isNaN(input.price)) {
      throw AppError.badRequest("price must be a number");
    }
    if (input.price < 0) {
      throw AppError.badRequest("price must be greater than or equal to 0");
    }

    if (
      typeof input.interviewLimit !== "number" ||
      Number.isNaN(input.interviewLimit)
    ) {
      throw AppError.badRequest("interviewLimit must be a number");
    }
    if (input.interviewLimit < 0) {
      throw AppError.badRequest(
        "interviewLimit must be greater than or equal to 0",
      );
    }

    if (
      typeof input.jobPostLimit !== "number" ||
      Number.isNaN(input.jobPostLimit)
    ) {
      throw AppError.badRequest("jobPostLimit must be a number");
    }
    if (input.jobPostLimit < 0) {
      throw AppError.badRequest(
        "jobPostLimit must be greater than or equal to 0",
      );
    }

    existing.name = name;
    existing.price = input.price;
    existing.duration = input.duration;
    existing.interviewLimit = input.interviewLimit;
    existing.interviewUnlimited = input.interviewUnlimited;
    existing.jobPostLimit = input.jobPostLimit;
    existing.jobUnlimited = input.jobUnlimited;
    existing.hasAI = input.hasAI;
    existing.isActive = input.isActive;
    existing.updatedAt = new Date();

    await this.subscriptionRepository.save(existing);
  }
}
