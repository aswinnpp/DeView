import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";



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


const Profile = lazy(() => import("../features/candidate/Profile"));



const AdminDashboard = lazy(() => import("../features/admin/AdminDashboard"));
const AdminLayout = lazy(() => import("../features/admin/AdminLayout"));
const AdminCompanyRequestsPage = lazy(() => import("../features/admin/AdminCompanyRequestsPage"));
const AdminCompanyManagement = lazy(() => import("../features/admin/AdminCompanyManagement"));


const CompanyLayout = lazy(() => import("../features/company/CompanyLayout"));




const LoadingFallback = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    Loading...
  </div>
);



const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/sign-up" element={<RegisterPage />} />
        <Route path="/company/approval" element={<Navigate to="/company/approval-form" replace />} />
        <Route path="/company/approval-form" element={<CompanyApprovalFormPage />} />
        <Route path="/company/approval-pending" element={<CompanyApprovalPendingPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />


        <Route path="/candidate" element={<Navigate to="/candidate/profile" replace />} />
        <Route path="/candidate/profile" element={<Profile />} />



        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="company-requests" element={<AdminCompanyRequestsPage />} />
          <Route path="companies" element={<AdminCompanyManagement />} />

        </Route>


        <Route path="/company" element={<CompanyLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CompanyDashboardPage />} />

        </Route>



        <Route path="/" element={<LandingPage />} />


        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
