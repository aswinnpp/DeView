import { inject, injectable } from "inversify";
import { AppError } from "../../../shared/errors/AppError.js";
import { TYPES } from "../../../shared/di/types.js";
import type { INotificationRepository } from "../ports/repository/INotificationRepository.js";
import type { IDeleteNotificationUseCase } from "../ports/usecase/IDeleteNotificationUseCase.js";
import type {
  IDeleteNotificationInputDTO,
  IDeleteNotificationOutputDTO,
} from "../dtos/NotificationDTO.js";

@injectable()
export class DeleteNotificationUseCase implements IDeleteNotificationUseCase {
  constructor(
    @inject(TYPES.NotificationRepositoryPort)
    private readonly _notifications: INotificationRepository,
  ) {}

  async execute(input: IDeleteNotificationInputDTO): Promise<IDeleteNotificationOutputDTO> {
    const ok = await this._notifications.delete({
      recipientType: "COMPANY",
      recipientId: input.companyId,
      notificationId: input.notificationId,
    });
    if (!ok) throw AppError.notFound("Notification not found.");
    return { ok: true };
  }
}

