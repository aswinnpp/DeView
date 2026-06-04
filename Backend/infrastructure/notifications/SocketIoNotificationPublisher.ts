import { injectable } from "inversify";
import type { INotificationPublisher } from "../../application/notification/ports/service/INotificationPublisher.js";
import type { Notification } from "../../domain/entities/Notification.js";
import { getSocketServer } from "../socket/socketContext.js";

@injectable()
export class SocketIoNotificationPublisher implements INotificationPublisher {
  async publish(input: {
    recipientType: "COMPANY" | "USER";
    recipientId: string;
    notification: Notification;
  }): Promise<void> {
    const io = getSocketServer();
    if (!io) return;

    const room =
      input.recipientType === "COMPANY"
        ? `company:${input.recipientId}`
        : `user:${input.recipientId}`;

    io.to(room).emit("notification:new", {
      id: input.notification.id,
      type: input.notification.type,
      title: input.notification.title,
      message: input.notification.message,
      data: input.notification.data,
      readAt: input.notification.readAt,
      createdAt: input.notification.createdAt,
    });
  }
}

