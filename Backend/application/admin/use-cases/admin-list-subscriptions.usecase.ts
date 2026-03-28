import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/di/types";
import type {
  IAdminListSubscriptionsUsecase,
} from "../ports/usecase/IAdmin-ListSubscriptionsUsecase";
import type { IListSubscriptionsInputDTO, IListSubscriptionsOutputDTO } from "../dtos/ListSubscriptionsDTO.js";
import type {
  ISubscriptionListOptions,
  ISubscriptionRepository,
} from "../ports/repository/ISubscriptionRepository";
import { AppError } from "../../../shared/errors/AppError";

@injectable()
export class AdminListSubscriptionsUsecase
  implements IAdminListSubscriptionsUsecase
{
  constructor(
    @inject(TYPES.SubscriptionRepositoryPort)
    private readonly _subscriptionRepository: ISubscriptionRepository
  ) {}

  async execute(input: IListSubscriptionsInputDTO): Promise<IListSubscriptionsOutputDTO> {
    const page: number | undefined = input.page;
    const limit: number | undefined = input.limit;

    if (page != null) {
      if (!Number.isInteger(page) || page <= 0) {
        throw AppError.badRequest("page must be a positive integer");
      }
    }

    console.log("tstt");
    

    if (limit != null) {
      if (!Number.isInteger(limit) || limit <= 0) {
        throw AppError.badRequest("limit must be a positive integer");
      }
    }

    const options: ISubscriptionListOptions = {
      search: input.search,
      status: input.status,
      duration: input.duration,
      sortOrder: input.sortOrder,
      page,
      limit,
    };

    const result = await this._subscriptionRepository.findAll(options);
    return result;
  }
}
