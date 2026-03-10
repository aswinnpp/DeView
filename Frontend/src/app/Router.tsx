import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PrivateRoute, PublicRoute } from "../components/common/routeGuards"



const LandingPage = lazy(() => import("../features/landing/LandingPage"));
const LoginPage = lazy(() => import("../features/auth/LoginPage"));
const RegisterPage = lazy(() => import("../features/auth/RegisterPage"));
const EmailVerificationPage = lazy(() => import("../features/auth/EmailVerificationPage"));
const ForgotPasswordPage = lazy(() => import("../features/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../features/auth/ResetPasswordPage"));
const AuthCallbackPage = lazy(() => import("../features/auth/AuthCallbackPage"));
const NotFoundPage = lazy(() => import("../features/error/NotFoundPage"));


// Company pages - moved from auth folder to company folder
const CompanyApprovalFormPage = lazy(() => import("../features/company/CompanyApprovalFormPage"));
const CompanyApprovalPendingPage = lazy(() => import("../features/company/CompanyApprovalPendingPage"));
const CompanyDashboardPage = lazy(() => import("../features/company/CompanyDashboardPage"));
const CompanyLayout = lazy(() => import("../features/company/CompanyLayout"));
const ManageHRPage = lazy(() => import("../features/company/ManageHRPage"));
const CompanyProfilePage = lazy(() => import("../features/company/CompanyProfilePage"));
const JobsPage = lazy(() => import("../features/jobs/JobsPage"));


const Profile = lazy(() => import("../features/candidate/Profile"));
const CandidateInterviews = lazy(() => import("../features/candidate/CandidateInterviews"));
const CandidateJobsPage = lazy(() => import("../features/candidate/CandidateJobsPage"));
const CandidateAppliedJobsPage = lazy(() => import("../features/candidate/CandidateAppliedJobsPage"));
const CandidateInterviewHistory = lazy(() => import("../features/candidate/InterviewHistory"));


const AdminDashboard = lazy(() => import("../features/admin/AdminDashboard"));
const AdminLayout = lazy(() => import("../features/admin/AdminLayout"));
const AdminCompanyRequestsPage = lazy(() => import("../features/admin/AdminCompanyRequestsPage"));
const AdminCompanyManagement = lazy(() => import("../features/admin/AdminCompanyManagement"));
const AdminCandidatesPage = lazy(() => import("../features/admin/AdminCandidatesPage"));
const AdminSubscriptionsPage = lazy(() => import("../features/admin/AdminSubscriptionsPage"));

const HRLayout = lazy(() => import("../features/hr/HRLayout"));
const HRDashboard = lazy(() => import("../features/hr/HRDashboard"));
const ApplicationsManagementPage = lazy(() => import("../features/application/ApplicationsManagement"));
const InterviewRoomPage = lazy(() => import("../features/interviewRoom/InterviewRoomPage"));

const InterviewerLayout = lazy(() => import("../features/interviewer/InterviewerLayout"));
const InterviewerDashboard = lazy(() => import("../features/interviewer/InterviewerDashboard"));
const InterviewerAssignments = lazy(() => import("../features/interviewer/InterviewerAssignments"));
const InterviewerManageInterviews = lazy(() => import("../features/interviewer/InterviewerManageInterviews"));
const InterviewerProfile = lazy(() => import("../features/interviewer/InterviewerProfile"));
const SlotBookingPage = lazy(() => import("../features/interviewer/SlotBookingPage"));

const LoadingFallback = () => (
  <div className="p-5 text-center">
    Loading...
  </div>
);




const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>

        {/* ─── Public Routes ───────────────────────── */}

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
        </Route>

        {/* Unprotected admin subscriptions preview route */}



        {/* ─── Protected Routes ───────────────────── */}

        <Route element={<PrivateRoute />}>
          <Route path="/company/approval" element={<Navigate to="/company/approval-form" replace />}/>
          <Route path="/company/approval-form" element={<CompanyApprovalFormPage />} />
          <Route path="/company/approval-pending" element={<CompanyApprovalPendingPage />} />

          <Route path="/candidate">
            <Route index element={<Navigate to="/candidate/profile" replace />}/>
            <Route path="profile" element={<Profile />} />
            <Route path="jobs" element={<CandidateJobsPage />} />
            <Route path="interviews" element={<CandidateInterviews />} />
            <Route path="applied" element={<CandidateAppliedJobsPage />} />
            <Route path="history" element={<CandidateInterviewHistory />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="company-requests" element={<AdminCompanyRequestsPage />} />
            <Route path="companies" element={<AdminCompanyManagement />} />
            <Route path="candidates" element={<AdminCandidatesPage />} />
            <Route path="subscriptions" element={<AdminSubscriptionsPage />} />

          </Route>

          <Route path="/company" element={<CompanyLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CompanyDashboardPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="applications" element={<ApplicationsManagementPage />} />
            <Route path="team" element={<ManageHRPage />} />
            <Route path="profile" element={<CompanyProfilePage />} />
          </Route>

          <Route path="/hr" element={<HRLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<HRDashboard />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="applications" element={<ApplicationsManagementPage />} />
          </Route>

          {/* Interviewer routes */}
          <Route path="/interviewer" element={<InterviewerLayout />}>
            <Route index element={<Navigate to="/interviewer/dashboard" replace />} />
            <Route path="dashboard" element={<InterviewerDashboard />} />
            <Route path="profile" element={<InterviewerProfile />} />
            <Route path="assignments" element={<InterviewerAssignments />} />
            <Route path="slots" element={<SlotBookingPage />} />
            <Route path="manage" element={<InterviewerManageInterviews />} />
          </Route>

          {/* Shared interview room route for authorized participants */}
          <Route path="/interviews/:interviewId/room" element={<InterviewRoomPage />} />
        </Route>

        


        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Suspense>
  );
};

export default AppRouter;
