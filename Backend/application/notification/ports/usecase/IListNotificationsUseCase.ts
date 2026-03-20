import type { Notification } from "../../../../domain/entities/Notification.js";

export interface IListNotificationsUseCase {
  execute(input: {
    companyId: string;
    unreadOnly?: boolean;
    limit?: number;
  }): Promise<{ data: Notification[] }>;
}

