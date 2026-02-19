import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../context/store";

/* ───────────────── PRIVATE ROUTES ───────────────── */

export function PrivateRoute() {
  const user = useSelector((state: RootState) => state.auth.user);

  // Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

/* ───────────────── PUBLIC ROUTES ───────────────── */

export function PublicRoute() {
  const user = useSelector((state: RootState) => state.auth.user);

  if (user) {
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin" replace />;

      case "company":
        return <Navigate to="/company" replace />;

      case "interviewer":
        return <Navigate to="/interviewer" replace />;

      case "candidate":
      default:
        return <Navigate to="/candidate" replace />;
    }
  }

  return <Outlet />;
}

