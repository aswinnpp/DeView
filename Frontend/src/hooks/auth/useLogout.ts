import { useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";

import { logoutAdmin, logoutUser } from "../../context/authSlice";
import type { AppDispatch } from "../../context/store";
import { authService } from "../../services/auth.service";
import { APP_ROUTES } from "../../constants/routes";

type LogoutSession = "admin" | "user";

export function useLogout(options?: { session?: LogoutSession }) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(() => {
    setIsLoggingOut(true);

    const session =
      options?.session ??
      (location.pathname.startsWith("/admin") ? "admin" : "user");

    if (session === "admin") {
      dispatch(logoutAdmin());
      void authService.adminLogout().catch(() => {});
      navigate(APP_ROUTES.ADMIN_LOGIN, { replace: true });
      return;
    }

    dispatch(logoutUser());
    void authService.logout().catch(() => {});
    navigate(APP_ROUTES.LOGIN, { replace: true });
  }, [dispatch, navigate, location.pathname, options?.session]);

  return {
    logout,
    isLoggingOut,
  };
}
