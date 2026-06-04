/** Company notifications — list / read / delete — input + output in one module. */

import type { NotificationType } from '../../../domain/entities/Notification.js';
import type { NotificationRecipientType } from '../../../domain/entities/Notification.js';

export interface IListNotificationsInputDTO {
  recipientType: NotificationRecipientType;
  recipientId: string;
  unreadOnly?: boolean;
  limit?: number;
}

export interface INotificationListItemDTO {
  id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | undefined;
  readAt: Date | undefined;
  createdAt: Date;
}

export interface IListNotificationsOutputDTO {
  data: INotificationListItemDTO[];
}

export interface IMarkNotificationReadInputDTO {
  companyId: string;
  notificationId: string;
}

export interface IMarkNotificationReadOutputDTO {
  ok: boolean;
}

export interface IDeleteNotificationInputDTO {
  companyId: string;
  notificationId: string;
}

export interface IDeleteNotificationOutputDTO {
  ok: boolean;
}
