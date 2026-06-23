import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  logoutAdmin,
  logoutUser,
} from "../../context/authSlice";

import type {
  AppDispatch,
  RootState,
} from "../../context/store";

import { authService } from "../../services/auth.service";
import { APP_ROUTES } from "../../constants/routes";

export function useLogout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const adminUser = useSelector(
    (state: RootState) => state.auth.adminUser
  );

  const normalUser = useSelector(
    (state: RootState) => state.auth.normalUser
  );

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(() => {
    setIsLoggingOut(true);

    const isAdmin =
      (adminUser?.role ?? "").toLowerCase() === "admin";

    if (isAdmin) {
      dispatch(logoutAdmin());

      void authService
        .adminLogout()
        .catch(() => {});
    } else {
      dispatch(logoutUser());

      void authService
        .logout()
        .catch(() => {});
    }

    navigate(APP_ROUTES.LOGIN, {
      replace: true,
    });
  }, [
    dispatch,
    navigate,
    adminUser,
    normalUser,
  ]);

  return {
    logout,
    isLoggingOut,
  };
}