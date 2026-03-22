import { inject, injectable } from "inversify";
import type { FastifyReply, FastifyRequest } from "fastify";
import { success } from "../../../shared/http/apiResponse.js";
import { TYPES } from "../../../shared/di/types.js";
import { AppError } from "../../../shared/errors/AppError.js";
import type { INotificationRepository } from "../../../application/notification/ports/repository/INotificationRepository.js";
import { NotificationMapper } from "../../../application/notification/mappers/NotificationMapper.js";

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
    const input = NotificationMapper.toListInput(request.currentUser, request.query);
    const data = await this._notifications.listByRecipient(input);
    reply.send(
      success({
        data: data.map((n) => NotificationMapper.toView(n)),
      }),
    );
  };

  markRead = async (
    request: FastifyRequest<{ Params: { notificationId: string } }>,
    reply: FastifyReply,
  ) => {
    const ok = await this._notifications.markRead(
      NotificationMapper.toMarkReadInput(request.currentUser, request.params.notificationId),
    );
    if (!ok) throw AppError.notFound("Notification not found.");
    reply.send(success({ ok: true }));
  };

  remove = async (
    request: FastifyRequest<{ Params: { notificationId: string } }>,
    reply: FastifyReply,
  ) => {
    const ok = await this._notifications.delete(
      NotificationMapper.toDeleteInput(request.currentUser, request.params.notificationId),
    );
    if (!ok) throw AppError.notFound("Notification not found.");
    reply.send(success({ ok: true }));
  };
}

