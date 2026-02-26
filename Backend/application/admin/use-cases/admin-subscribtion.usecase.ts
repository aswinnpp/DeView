import { injectable, inject } from 'inversify';
import { IAdminCreateSubscribtion, ICreateSubscribtionInput } from "../ports/usecase/IAdmin-CreateSubscribtionUsecase";
import { TYPES } from "../../../shared/di/types";
import { ISubscribtionRepository } from "../ports/repository/ISubscribtionRepository";
import { Subscribtion } from "../../../domain/admin/entities/Subscribtion";
import { AppError } from "../../../shared/errors/AppError";

@injectable()
export class AdminCreateSubscribtion implements IAdminCreateSubscribtion {
    constructor(
      @inject(TYPES.SubscribtionRepositoryPort)
      private readonly subscribtionRepository: ISubscribtionRepository,
    ) {}  

    async execute(input: ICreateSubscribtionInput): Promise<void> {
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

      const entity = new Subscribtion(
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

      await this.subscribtionRepository.save(entity);
    }
}

