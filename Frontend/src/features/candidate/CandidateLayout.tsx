import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../context/store";
import { APP_ROUTES } from "../../constants/routes";

export default function CandidateLayout() {
const adminUser = useSelector(
  (state: RootState) => state.auth.adminUser
);

const normalUser = useSelector(
  (state: RootState) => state.auth.normalUser
);

const user = adminUser ?? normalUser;
  if (!user) {
    return <Navigate to={APP_ROUTES.LOGIN} replace />;
  }

  const role = (user.role || "").toLowerCase();
  if (role !== "candidate") {
    switch (role) {
      case "admin":
        return <Navigate to={APP_ROUTES.ADMIN_DASHBOARD} replace />;
      case "company":
        return <Navigate to={APP_ROUTES.COMPANY_DASHBOARD} replace />;
      case "hr":
        return <Navigate to={APP_ROUTES.HR_DASHBOARD} replace />;
      case "interviewer":
        return <Navigate to={APP_ROUTES.INTERVIEWER_ASSIGNMENTS} replace />;
      default:
        return <Navigate to={APP_ROUTES.ROOT} replace />;
    }
  }

  return <Outlet />;
}

