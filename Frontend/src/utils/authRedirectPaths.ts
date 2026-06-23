import { APP_ROUTES } from "../constants/routes";

export function getNormalUserDashboardPath(role: string): string {
  switch (role.toLowerCase()) {
    case "company":
      return APP_ROUTES.COMPANY_DASHBOARD;
    case "hr":
      return APP_ROUTES.HR_DASHBOARD;
    case "interviewer":
      return APP_ROUTES.INTERVIEWER_ASSIGNMENTS;
    default:
      return APP_ROUTES.CANDIDATE_INTERVIEWS;
  }
}
