import type {
  IListNotificationsInputDTO,
  IListNotificationsOutputDTO,
} from '../../dtos/NotificationDTO.js';

export interface IListNotificationsUseCase {
  execute(input: IListNotificationsInputDTO): Promise<IListNotificationsOutputDTO>;
}
