import type {
  IDeleteNotificationInputDTO,
  IDeleteNotificationOutputDTO,
} from '../../dtos/NotificationDTO.js';

export interface IDeleteNotificationUseCase {
  execute(input: IDeleteNotificationInputDTO): Promise<IDeleteNotificationOutputDTO>;
}
