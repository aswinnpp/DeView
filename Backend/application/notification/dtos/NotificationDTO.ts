/** Company notifications — list / read / delete — input + output in one module. */

import type { Notification } from '../../../domain/entities/Notification.js';

export interface IListNotificationsInputDTO {
  companyId: string;
  unreadOnly?: boolean;
  limit?: number;
}

export interface IListNotificationsOutputDTO {
  data: Notification[];
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
