import AdminDashboard from "@/features/admin/AdminDashboard";

export const API_ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        VERIFY_OTP: '/auth/verify-otp',
        VERIFY_PASSWORD_RESET_OTP: '/auth/verify-password-reset-otp',
        RESEND_OTP: '/auth/resend-otp',
        GOOGLE_EXCHANGE: '/auth/google/exchange',
        GOOGLE_BASE: '/auth/google',
    },
    COMPANY: {
        CHECK_STATUS: '/company/check-status',
        SUBMIT_APPROVAL: '/company/submit',
        MY_APPROVAL: '/company/my-approval',
        PROFILE: '/company/profile',
        HR_LIST: '/company/hr/list',
        HR_CREATE: '/company/hr/create',
        HR_TOGGLE_STATUS: (id: string) => `/company/hr/${id}/toggle-status`,
        INTERVIEWER_LIST: '/company/interviewer/list',
        INTERVIEWER_CREATE: '/company/interviewer/create',
        INTERVIEWER_TOGGLE_STATUS: (id: string) => `/company/interviewer/${id}/toggle-status`,
    },
    ADMIN: {
        COMPANY_PENDING: '/admin/company-requests/pending',
        COMPANY_APPROVE: (id: string) => `/admin/company-requests/${id}/approve`,
        COMPANY_REJECT: (id: string) => `/admin/company-requests/${id}/reject`,
        COMPANY_DOCUMENT_MARK: (companyId: string, documentKey: string) =>
            `/admin/company-requests/${companyId}/documents/${documentKey}/mark`,
    },
    CANDIDATE: {
        PROFILE: '/candidate/profile',
        GETALL: '/candidate/list'
    },
} as const;

export const APP_ROUTES = {
    ROOT: '/',
    LOGIN: '/login',
    RESET_PASSWORD: '/reset-password',
    COMPANY_DASHBOARD: '/company/dashboard',
    COMPANY_APPROVAL_PENDING: '/company/approval-pending',
    COMPANY_APPROVAL_FORM: '/company/approval-form',
    CANDIDATE_INTERVIEWS:"/candidate/interviews",
    CANDIDATE_PROFILE: '/candidate/profile',
    HR_DASHBOARD: '/hr/dashboard',
    ADMIN_DASHBOARD: '/admin',
} as const;

