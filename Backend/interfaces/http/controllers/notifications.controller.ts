import { inject, injectable } from "inversify";
import type { FastifyReply, FastifyRequest } from "fastify";
import { success } from "../../../shared/http/apiResponse.js";
import { TYPES } from "../../../shared/di/types.js";
import { AppError } from "../../../shared/errors/AppError.js";
import type { INotificationRepository } from "../../../application/notification/ports/repository/INotificationRepository.js";

function resolveRecipient(user: { role: string; userId: string; companyId?: string }) {
  const role = (user.role || "").toLowerCase();
  if (role === "company") {
    if (!user.companyId) throw AppError.forbidden("Company context missing.");
    return { recipientType: "COMPANY" as const, recipientId: user.companyId };
  }
  return { recipientType: "USER" as const, recipientId: user.userId };
}

@injectable()
export class NotificationsController {
  constructor(
    @inject(TYPES.NotificationRepositoryPort)
    private readonly _notifications: INotificationRepository,
  ) {}

  list = async (
    request: FastifyRequest<{ Querystring: { unreadOnly?: string; limit?: string } }>,
    reply: FastifyReply,
  ) => {
    const { recipientType, recipientId } = resolveRecipient(request.currentUser);
    const unreadOnly = request.query.unreadOnly !== "false";
    const limit = request.query.limit ? Number(request.query.limit) : undefined;

    const data = await this._notifications.listByRecipient({
      recipientType,
      recipientId,
      unreadOnly,
      limit,
    });
    reply.send(
      success({
        data: data.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          data: n.data,
          readAt: n.readAt,
          createdAt: n.createdAt,
        })),
      }),
    );
  };

  markRead = async (
    request: FastifyRequest<{ Params: { notificationId: string } }>,
    reply: FastifyReply,
  ) => {
    const { recipientType, recipientId } = resolveRecipient(request.currentUser);
    const ok = await this._notifications.markRead({
      recipientType,
      recipientId,
      notificationId: request.params.notificationId,
    });
    if (!ok) throw AppError.notFound("Notification not found.");
    reply.send(success({ ok: true }));
  };

  remove = async (
    request: FastifyRequest<{ Params: { notificationId: string } }>,
    reply: FastifyReply,
  ) => {
    const { recipientType, recipientId } = resolveRecipient(request.currentUser);
    const ok = await this._notifications.delete({
      recipientType,
      recipientId,
      notificationId: request.params.notificationId,
    });
    if (!ok) throw AppError.notFound("Notification not found.");
    reply.send(success({ ok: true }));
  };
}

