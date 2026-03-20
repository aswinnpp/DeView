import { injectable, inject } from 'inversify';
import { IAdminCreateSubscription } from "../ports/usecase/IAdmin-CreateSubscriptionUsecase";
import type { ICreateSubscriptionInputDTO } from "../dtos/CreateSubscriptionDTO.js";
import { TYPES } from "../../../shared/di/types";
import { ISubscriptionRepository } from "../ports/repository/ISubscriptionRepository";
import { Subscription } from "../../../domain/entities/Subscription";
import { AppError } from "../../../shared/errors/AppError";

@injectable()
export class AdminCreateSubscription implements IAdminCreateSubscription {
    constructor(
      @inject(TYPES.SubscriptionRepositoryPort)
      private readonly _subscriptionRepository: ISubscriptionRepository,
    ) {}  

    async execute(input: ICreateSubscriptionInputDTO): Promise<void> {
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

      const entity = new Subscription(
        null,
        name,
        input.price,
        input.duration,
        input.interviewLimit,
        input.interviewUnlimited,
        input.jobPostLimit,
        input.jobUnlimited,
        input.hasAI,
        input.isActive
      );

      await this._subscriptionRepository.save(entity);
    }
}
