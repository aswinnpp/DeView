import type { ICreateSubscriptionInputDTO } from '../../dtos/CreateSubscriptionDTO.js';

export type IUpdateSubscriptionInput = ICreateSubscriptionInputDTO;

export interface IAdminUpdateSubscriptionUsecase {
  execute(id: string, input: IUpdateSubscriptionInput): Promise<void>;
}
