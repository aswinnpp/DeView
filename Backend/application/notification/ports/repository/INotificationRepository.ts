import type { Notification } from "../../../../domain/entities/Notification.js";
import type { NotificationType } from "../../../../domain/entities/Notification.js";
import type { NotificationRecipientType } from "../../../../domain/entities/Notification.js";

export interface INotificationRepository {
  create(input: {
    recipientType: NotificationRecipientType;
    recipientId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }): Promise<Notification>;

  listByRecipient(input: {
    recipientType: NotificationRecipientType;
    recipientId: string;
    unreadOnly?: boolean;
    limit?: number;
  }): Promise<Notification[]>;

  markRead(input: {
    recipientType: NotificationRecipientType;
    recipientId: string;
    notificationId: string;
  }): Promise<boolean>;

  delete(input: {
    recipientType: NotificationRecipientType;
    recipientId: string;
    notificationId: string;
  }): Promise<boolean>;
}

