import { api } from "../api/axios";
import { API_ROUTES } from "../constants/routes";

export type NotificationScope = "company" | "candidate" | "admin" | "interviewer" | "hr";

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string | Date;
  readAt?: string | Date;
  data?: Record<string, unknown>;
};

function getRoutes(scope: NotificationScope) {
  if (scope === "company") return API_ROUTES.COMPANY.NOTIFICATIONS;
  if (scope === "admin") return API_ROUTES.ADMIN.NOTIFICATIONS;
  if (scope === "interviewer") return API_ROUTES.INTERVIEWER.NOTIFICATIONS;
  if (scope === "hr") return API_ROUTES.COMPANY.NOTIFICATIONS;
  return API_ROUTES.CANDIDATE.NOTIFICATIONS;
}

export const notificationsService = {
  list(scope: NotificationScope, params?: { unreadOnly?: boolean; limit?: number }) {
    const r = getRoutes(scope);
    return api.get<{ data: AppNotification[] }>(r.LIST, {
      params: {
        unreadOnly: params?.unreadOnly === false ? "false" : "true",
        ...(params?.limit != null ? { limit: String(params.limit) } : {}),
      },
    });
  },

  markRead(scope: NotificationScope, notificationId: string) {
    const r = getRoutes(scope);
    return api.patch<{ ok: boolean }>(r.MARK_READ(notificationId));
  },

  remove(scope: NotificationScope, notificationId: string) {
    const r = getRoutes(scope);
    return api.delete<{ ok: boolean }>(r.DELETE(notificationId));
  },
};

