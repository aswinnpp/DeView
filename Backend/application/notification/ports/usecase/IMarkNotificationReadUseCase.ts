import type {
  IMarkNotificationReadInputDTO,
  IMarkNotificationReadOutputDTO,
} from '../../dtos/NotificationDTO.js';

export interface IMarkNotificationReadUseCase {
  execute(input: IMarkNotificationReadInputDTO): Promise<IMarkNotificationReadOutputDTO>;
}
