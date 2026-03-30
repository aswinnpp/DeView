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

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await notificationsService.list(scope, { unreadOnly: true, limit: 50 });
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

    const socket: Socket = io(window.location.origin, { withCredentials: true });

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

