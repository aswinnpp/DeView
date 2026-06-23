import { Navigate, Outlet ,useLocation} from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import type { RootState } from "../../context/store";
import { authService } from "../../services/auth.service";
import { APP_ROUTES } from "../../constants/routes";

/* ───────────────── PRIVATE ROUTES ───────────────── */
export function PrivateRoute() {
  const adminUser = useSelector(
    (state: RootState) => state.auth.adminUser
  );

  const normalUser = useSelector(
    (state: RootState) => state.auth.normalUser
  );

  if (!adminUser && !normalUser) {
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
        const { data: result } =
          await authService.checkCompanyStatus();

        if (!result) {
          if (!cancelled) {
            setTarget(
              APP_ROUTES.COMPANY_APPROVAL_FORM
            );
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
            next =
              APP_ROUTES.COMPANY_APPROVAL_PENDING;
            break;

          default:
            next =
              APP_ROUTES.COMPANY_APPROVAL_FORM;
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


export function PublicRoute() {
  const location = useLocation();

  const adminUser = useSelector(
    (state: RootState) => state.auth.adminUser
  );

  const normalUser = useSelector(
    (state: RootState) => state.auth.normalUser
  );

  const isAdminPath =
    location.pathname.startsWith("/admin");

  const user = isAdminPath
    ? adminUser
    : normalUser;

  if (!user) {
    return <Outlet />;
  }

  const role = user.role.toLowerCase();

  switch (role) {
    case "admin":
      return (
        <Navigate
          to={APP_ROUTES.ADMIN_DASHBOARD}
          replace
        />
      );

    case "company":
      return <CompanyPublicRedirect />;

    case "hr":
      return (
        <Navigate
          to={APP_ROUTES.HR_DASHBOARD}
          replace
        />
      );

    case "interviewer":
      return (
        <Navigate
          to={APP_ROUTES.INTERVIEWER_ASSIGNMENTS}
          replace
        />
      );

    default:
      return (
        <Navigate
          to={APP_ROUTES.CANDIDATE_INTERVIEWS}
          replace
        />
      );
  }
}