import type { Notification } from "../../../../domain/notification/entities/Notification.js";
import type { NotificationRecipientType } from "../../../../domain/notification/entities/Notification.js";

export interface INotificationPublisher {
  publish(input: {
    recipientType: NotificationRecipientType;
    recipientId: string;
    notification: Notification;
  }): Promise<void>;
}

