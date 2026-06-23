import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authService } from "../services/auth.service";
import { APP_ROUTES } from "../constants/routes";
import type { IUser } from "../context/authSlice";
import { getNormalUserDashboardPath } from "./authRedirectPaths";

function CompanyPublicRedirect() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: result } = await authService.checkCompanyStatus();

        if (!result) {
          if (!cancelled) {
            setTarget(APP_ROUTES.COMPANY_APPROVAL_FORM);
          }
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

        if (!cancelled) {
          setTarget(next);
        }
      } catch {
        if (!cancelled) {
          setTarget(APP_ROUTES.ROOT);
        }
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

export function NormalUserRedirect({ user }: { user: IUser }) {
  const role = user.role.toLowerCase();

  if (role === "company") {
    return <CompanyPublicRedirect />;
  }

  return <Navigate to={getNormalUserDashboardPath(role)} replace />;
}
