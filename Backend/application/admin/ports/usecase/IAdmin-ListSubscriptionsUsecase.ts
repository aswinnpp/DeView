import type {
  IListSubscriptionsInputDTO,
  IListSubscriptionsOutputDTO,
} from '../../dtos/ListSubscriptionsDTO.js';

export interface IAdminListSubscriptionsUsecase {
  execute(input: IListSubscriptionsInputDTO): Promise<IListSubscriptionsOutputDTO>;
}
