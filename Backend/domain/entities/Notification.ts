export type NotificationType = "NEW_APPLICATION" | "NEW_JOB";
export type NotificationRecipientType = "COMPANY" | "USER";

export class Notification {
  constructor(
    public readonly id: string | null,
    public readonly recipientType: NotificationRecipientType,
    public readonly recipientId: string,
    public readonly type: NotificationType,
    public readonly title: string,
    public readonly message: string,
    public readonly data: Record<string, unknown> | undefined,
    public readonly readAt: Date | undefined,
    public readonly createdAt: Date,
  ) {}
}

