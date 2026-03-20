import type { Notification } from "../../../../domain/entities/Notification.js";
import type { NotificationRecipientType } from "../../../../domain/entities/Notification.js";

export interface INotificationPublisher {
  publish(input: {
    recipientType: NotificationRecipientType;
    recipientId: string;
    notification: Notification;
  }): Promise<void>;
}

