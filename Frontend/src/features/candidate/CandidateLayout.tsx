import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../context/store";
import { APP_ROUTES } from "../../constants/routes";

export default function CandidateLayout() {
  const normalUser = useSelector(
    (state: RootState) => state.auth.normalUser
  );

  if (!normalUser) {
    return <Navigate to={APP_ROUTES.LOGIN} replace />;
  }

  const role = (normalUser.role || "").toLowerCase();

  if (role !== "candidate") {
    switch (role) {
      case "company":
        return (
          <Navigate
            to={APP_ROUTES.COMPANY_DASHBOARD}
            replace
          />
        );

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
            to={APP_ROUTES.ROOT}
            replace
          />
        );
    }
  }

  return <Outlet />;
}