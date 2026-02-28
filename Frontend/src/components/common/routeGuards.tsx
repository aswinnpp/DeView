import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import type { RootState } from "../../context/store";
import { authService } from "../../services/auth.service";
import { APP_ROUTES } from "../../constants/routes";

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

function CompanyPublicRedirect() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: result } = await authService.checkCompanyStatus();

        if (!result) {
          if (!cancelled) setTarget(APP_ROUTES.COMPANY_APPROVAL_FORM);
          return;
        }

        let next: string;
        switch (result.status) {
          case "approved":
            next = APP_ROUTES.COMPANY_DASHBOARD;
            break;
          case "pending":
          case "rejected":
            next = APP_ROUTES.COMPANY_APPROVAL_PENDING;
            break;
          default:
            next = APP_ROUTES.COMPANY_APPROVAL_FORM;
        }

        if (!cancelled) setTarget(next);
      } catch {
        if (!cancelled) setTarget(APP_ROUTES.ROOT);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!target) {
    return null;
  }

  return <Navigate to={target} replace />;
}

export function PublicRoute() {
  const user = useSelector((state: RootState) => state.auth.user);

  if (user) {
    switch (user.role) {
      case "admin":
        return <Navigate to={APP_ROUTES.ADMIN_DASHBOARD} replace />;

      case "company":
        return <CompanyPublicRedirect />;

      case "hr":
        return <Navigate to={APP_ROUTES.HR_DASHBOARD} replace />;

      case "candidate":
      default:
        return <Navigate to="/candidate" replace />;
    }
  }

  return <Outlet />;
}

