import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout as clearAuth } from "../../context/authSlice";
import type { AppDispatch } from "../../context/store";
import { authService } from "../../services/auth.service";
import { APP_ROUTES } from "../../constants/routes";


export function useLogout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(() => {
    setIsLoggingOut(true);
    dispatch(clearAuth());
    navigate(APP_ROUTES.LOGIN, { replace: true });
    void authService.logout().catch(() => {});
  }, [dispatch, navigate]);

  return { logout, isLoggingOut };
}
