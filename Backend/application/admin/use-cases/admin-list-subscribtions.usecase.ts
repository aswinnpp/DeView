import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/di/types";
import type {
  IAdminListSubscribtionsUsecase,
  IListSubscribtionsInput,
  IListSubscribtionsOutput,
} from "../ports/usecase/IAdmin-ListSubscribtionsUsecase";
import type {
  ISubscribtionListOptions,
  ISubscribtionRepository,
} from "../ports/repository/ISubscribtionRepository";
import { AppError } from "../../../shared/errors/AppError";

@injectable()
export class AdminListSubscribtionsUsecase
  implements IAdminListSubscribtionsUsecase
{
  constructor(
    @inject(TYPES.SubscribtionRepositoryPort)
    private readonly subscribtionRepository: ISubscribtionRepository
  ) {}

  async execute(input: IListSubscribtionsInput): Promise<IListSubscribtionsOutput> {
    const page: number | undefined = input.page;
    const limit: number | undefined = input.limit;

    if (page != null) {
      if (!Number.isInteger(page) || page <= 0) {
        throw AppError.badRequest("page must be a positive integer");
      }
    }

    if (limit != null) {
      if (!Number.isInteger(limit) || limit <= 0) {
        throw AppError.badRequest("limit must be a positive integer");
      }
    }

    const options: ISubscribtionListOptions = {
      search: input.search,
      status: input.status,
      duration: input.duration,
      sortOrder: input.sortOrder,
      page,
      limit,
    };

    const result = await this.subscribtionRepository.findAll(options);
    return result;
  }
}

