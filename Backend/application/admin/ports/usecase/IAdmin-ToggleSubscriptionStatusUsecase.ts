import type {
  ISubscriptionToggleStatusInputDTO,
  ISubscriptionToggleStatusOutputDTO,
} from '../../dtos/SubscriptionToggleStatusDTO.js';

export interface IAdminToggleSubscriptionStatusUsecase {
  execute(input: ISubscriptionToggleStatusInputDTO): Promise<ISubscriptionToggleStatusOutputDTO>;
}
