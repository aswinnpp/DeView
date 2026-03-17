import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/di/types.js";
import type { INotificationRepository } from "../ports/repository/INotificationRepository.js";
import type { IListNotificationsUseCase } from "../ports/usecase/IListNotificationsUseCase.js";

@injectable()
export class ListNotificationsUseCase implements IListNotificationsUseCase {
  constructor(
    @inject(TYPES.NotificationRepositoryPort)
    private readonly _notifications: INotificationRepository,
  ) {}

  async execute(input: { companyId: string; unreadOnly?: boolean; limit?: number }) {
    const data = await this._notifications.listByRecipient({
      recipientType: "COMPANY",
      recipientId: input.companyId,
      unreadOnly: input.unreadOnly,
      limit: input.limit,
    });
    return { data };
  }
}

