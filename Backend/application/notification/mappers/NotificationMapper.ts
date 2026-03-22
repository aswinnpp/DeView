import { AppError } from '../../../shared/errors/AppError.js';
import type { Notification } from '../../../domain/entities/Notification.js';

type CurrentUser = { role: string; userId: string; companyId?: string };

export const NotificationMapper = {
  toRecipient(user: CurrentUser) {
    const role = (user.role || '').toLowerCase();
    if (role === 'company') {
      if (!user.companyId) throw AppError.forbidden('Company context missing.');
      return { recipientType: 'COMPANY' as const, recipientId: user.companyId };
    }
    return { recipientType: 'USER' as const, recipientId: user.userId };
  },

  toListInput(user: CurrentUser, query: { unreadOnly?: string; limit?: string }) {
    const { recipientType, recipientId } = NotificationMapper.toRecipient(user);
    const unreadOnly = query.unreadOnly !== 'false';
    const limit = query.limit ? Number(query.limit) : undefined;
    return { recipientType, recipientId, unreadOnly, limit };
  },

  toView(n: Notification) {
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      data: n.data,
      readAt: n.readAt,
      createdAt: n.createdAt,
    };
  },

  toMarkReadInput(user: CurrentUser, notificationId: string) {
    return { ...NotificationMapper.toRecipient(user), notificationId };
  },

  toDeleteInput(user: CurrentUser, notificationId: string) {
    return { ...NotificationMapper.toRecipient(user), notificationId };
  },
};
