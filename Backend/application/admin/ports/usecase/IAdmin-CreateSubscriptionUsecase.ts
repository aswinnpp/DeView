import type { ICreateSubscriptionInputDTO } from '../../dtos/CreateSubscriptionDTO.js';

export interface IAdminCreateSubscription {
  execute(input: ICreateSubscriptionInputDTO): Promise<void>;
}
