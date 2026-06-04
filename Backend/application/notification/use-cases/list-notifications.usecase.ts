import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/di/types.js";
import type { INotificationRepository } from "../ports/repository/INotificationRepository.js";
import type { IListNotificationsUseCase } from "../ports/usecase/IListNotificationsUseCase.js";
import type {
  IListNotificationsInputDTO,
  IListNotificationsOutputDTO,
} from "../dtos/NotificationDTO.js";
import { NotificationMapper } from "../mappers/NotificationMapper.js";

@injectable()
export class ListNotificationsUseCase implements IListNotificationsUseCase {
  constructor(
    @inject(TYPES.NotificationRepositoryPort)
    private readonly _notifications: INotificationRepository,
  ) {}

  async execute(input: IListNotificationsInputDTO): Promise<IListNotificationsOutputDTO> {
    const rows = await this._notifications.listByRecipient({
      recipientType: input.recipientType,
      recipientId: input.recipientId,
      unreadOnly: input.unreadOnly,
      limit: input.limit,
    });
    const data = rows.map((n) => NotificationMapper.toView(n));
    return { data };
  }
}

