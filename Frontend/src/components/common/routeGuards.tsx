import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../context/store";
import { APP_ROUTES } from "../../constants/routes";
import { NormalUserRedirect } from "../../utils/authRedirects";

/* ───────────────── PRIVATE ROUTES ───────────────── */
export function PrivateRoute() {
  const { pathname } = useLocation();
  const adminUser = useSelector(
    (state: RootState) => state.auth.adminUser
  );
  const normalUser = useSelector(
    (state: RootState) => state.auth.normalUser
  );

  const isAdminArea =
    pathname.startsWith("/admin") && pathname !== APP_ROUTES.ADMIN_LOGIN;

  if (isAdminArea) {
    if (!adminUser) {
      return <Navigate to={APP_ROUTES.ADMIN_LOGIN} replace />;
    }
    return <Outlet />;
  }

  if (!normalUser) {
    return <Navigate to={APP_ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}

/* ───────────────── PUBLIC ROUTES ───────────────── */

export function PublicRoute() {
  return <Outlet />;
}

export function UserLoginRoute() {
  const normalUser = useSelector(
    (state: RootState) => state.auth.normalUser
  );

  if (!normalUser) {
    return <Outlet />;
  }

  return <NormalUserRedirect user={normalUser} />;
}

export function AdminLoginRoute() {
  const adminUser = useSelector(
    (state: RootState) => state.auth.adminUser
  );

  if (!adminUser) {
    return <Outlet />;
  }

  return <Navigate to={APP_ROUTES.ADMIN_DASHBOARD} replace />;
}
