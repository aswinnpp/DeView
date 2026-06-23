import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout as clearAuth } from "../../context/authSlice";
import type { AppDispatch, RootState } from "../../context/store";
import { authService } from "../../services/auth.service";
import { APP_ROUTES } from "../../constants/routes";


export function useLogout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(() => {
    setIsLoggingOut(true);
    dispatch(clearAuth());
    navigate(APP_ROUTES.LOGIN, { replace: true });
    const isAdmin = (user?.role ?? "").toLowerCase() === "admin";
    const logoutRequest = isAdmin ? authService.adminLogout() : authService.logout();
    void logoutRequest.catch(() => {});
  }, [dispatch, navigate, user?.role]);

  return { logout, isLoggingOut };
}
