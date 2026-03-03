import type { IToggleStatusResultDTO } from '../../dtos/ToggleStatusDTO.js';

export interface IAdminToggleSubscriptionStatusUsecase {
  execute(id: string): Promise<IToggleStatusResultDTO>;
}
