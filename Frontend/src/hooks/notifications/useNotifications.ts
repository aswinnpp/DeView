import { useCallback, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import type { RootState } from "../../context/store";
import type { AppNotification, NotificationScope } from "../../services/notifications.service";
import { notificationsService } from "../../services/notifications.service";


function formatTime(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export function useNotifications(scope: NotificationScope) {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id ?? "";
  const companyId = user?.companyId ?? "";

  const recipient = useMemo(() => {
    if (scope === "company" || scope === "hr") return { kind: "company" as const, id: companyId };
    return { kind: "user" as const, id: userId };
  }, [scope, companyId, userId]);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const NOTIFICATIONS_LIMIT = parseInt(import.meta.env.VITE_NOTIFICATIONS_FETCH_LIMIT || '50', 10);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await notificationsService.list(scope, { unreadOnly: true, limit: NOTIFICATIONS_LIMIT });
      setNotifications(data?.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    // Load unread once so badge count is available immediately.
    refresh().catch(() => {
      setNotifications([]);
    });
  }, [refresh]);

  useEffect(() => {
    if (!recipient.id) return;

    const socketEnv = import.meta.env.VITE_SOCKET_URL?.trim();
    const apiBase = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";
    const socketUrl = (() => {
      if (socketEnv) {
        const raw = socketEnv.includes("://") ? socketEnv : `https://${socketEnv}`;
        return new URL(raw).origin;
      }
      if (apiBase.startsWith("/")) return window.location.origin;
      if (apiBase.startsWith("http")) return new URL(apiBase).origin;
      return window.location.origin;
    })();

    const socket: Socket = io(socketUrl, { withCredentials: true });

    socket.on("connect", () => {
      if (recipient.kind === "company") socket.emit("join-company-notifications", { companyId: recipient.id });
      else socket.emit("join-user-notifications", { userId: recipient.id });
    });

    const onNew = (payload: AppNotification) => {
      setNotifications((prev) => {
        if (!payload?.id) return prev;
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [payload, ...prev];
      });
    };

    socket.on("notification:new", onNew);

    return () => {
      socket.off("notification:new", onNew);
      socket.disconnect();
    };
  }, [recipient.kind, recipient.id]);

  const markRead = useCallback(
    async (notificationId: string) => {
      await notificationsService.markRead(scope, notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    },
    [scope],
  );

  return {
    notifications,
    unreadCount: notifications.length,
    loading,
    refresh,
    markRead,
    formatTime,
  };
}

