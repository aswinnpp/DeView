import type { ObjectId } from "mongodb";

export type NotificationType =
  | "NEW_APPLICATION"
  | "NEW_JOB"
  | "APPLICATION_SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "NEW_COMPANY_REGISTRATION";
export type NotificationRecipientType = "COMPANY" | "USER";

export interface INotificationDocument {
  _id?: ObjectId;
  recipientType: NotificationRecipientType;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  readAt?: Date;
  createdAt: Date;
}

