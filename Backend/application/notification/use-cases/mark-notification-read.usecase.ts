import { inject, injectable } from "inversify";
import { AppError } from "../../../shared/errors/AppError.js";
import { TYPES } from "../../../shared/di/types.js";
import type { INotificationRepository } from "../ports/repository/INotificationRepository.js";
import type { IMarkNotificationReadUseCase } from "../ports/usecase/IMarkNotificationReadUseCase.js";

@injectable()
export class MarkNotificationReadUseCase implements IMarkNotificationReadUseCase {
  constructor(
    @inject(TYPES.NotificationRepositoryPort)
    private readonly _notifications: INotificationRepository,
  ) {}

  async execute(input: { companyId: string; notificationId: string }) {
    const ok = await this._notifications.markRead({
      recipientType: "COMPANY",
      recipientId: input.companyId,
      notificationId: input.notificationId,
    });
    if (!ok) throw AppError.notFound("Notification not found.");
    return { ok: true };
  }
}

