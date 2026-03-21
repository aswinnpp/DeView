
export const API_ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        VERIFY_OLD_PASSWORD: '/auth/verify-old-password',
        CHANGE_PASSWORD: '/auth/change-password',
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
        SUBSCRIPTION_LIST: '/company/subscription',
        CREATE_PAYMENT_INTENT: '/company/payments/create-intent',
        ACTIVATE_PENDING_SUBSCRIPTION: (pendingId: string) =>
            `/company/subscriptions/pending/${pendingId}/activate-now`,
        HR_LIST: '/company/hr/list',
        HR_CREATE: '/company/hr/create',
        HR_TOGGLE_STATUS: (id: string) => `/company/hr/${id}/toggle-status`,
        INTERVIEWER_LIST: '/company/interviewer/list',
        INTERVIEWER_CREATE: '/company/interviewer/create',
        INTERVIEWER_TOGGLE_STATUS: (id: string) => `/company/interviewer/${id}/toggle-status`,
        INTERVIEWER_SLOTS: (id: string) => `/company/interviewer/${id}/slots`,
        NOTIFICATIONS: {
            LIST: '/company/notifications',
            MARK_READ: (notificationId: string) => `/company/notifications/${notificationId}/read`,
            DELETE: (notificationId: string) => `/company/notifications/${notificationId}`,
        },
    },
    JOB: {
        JOBS_LIST: '/jobs',
        JOB_CREATE: '/jobs',
        JOB_UPDATE: (id: string) => `/jobs/${id}`,
        JOB_TOGGLE_STATUS: (id: string) => `/jobs/${id}/status`,
        JOB_SUBSCRIPTION: '/jobs/subscription',
    },
    /** Applications API – company/HR only, independent prefix like jobs */
    APPLICATIONS: {
        JOBS_LIST: '/applications/jobs',
        PENDING_APPLICATIONS: (jobId: string) => `/applications/jobs/${jobId}/applications`,
        RESUME_VIEW_URL: (jobId: string, applicationId: string) =>
            `/applications/jobs/${jobId}/applications/${applicationId}/resume-view-url`,
        INTERVIEW_PRECHECK: (jobId: string, applicationId: string) =>
            `/applications/jobs/${jobId}/applications/${applicationId}/interview/precheck`,
        LATEST_INTERVIEWER_FEEDBACK: (jobId: string, applicationId: string) =>
            `/applications/jobs/${jobId}/applications/${applicationId}/interviewer-feedback`,
        SCORE_CANDIDATES: (jobId: string) => `/applications/jobs/${jobId}/score-candidates`,
        UPDATE_STATUS: (jobId: string, applicationId: string) =>
            `/applications/jobs/${jobId}/applications/${applicationId}/status`,
        SCHEDULE_INTERVIEW: (jobId: string, applicationId: string) =>
            `/applications/jobs/${jobId}/applications/${applicationId}/interview`,
        DECLINE_RESCHEDULE: (jobId: string, applicationId: string) =>
            `/applications/jobs/${jobId}/applications/${applicationId}/reschedule/decline`,
    },
    ADMIN: {
        COMPANY_PENDING: '/admin/company-requests/pending',
        COMPANY_APPROVE: (id: string) => `/admin/company-requests/${id}/approve`,
        COMPANY_REJECT: (id: string) => `/admin/company-requests/${id}/reject`,
        COMPANY_DOCUMENT_MARK: (companyId: string, documentKey: string) =>
            `/admin/company-requests/${companyId}/documents/${documentKey}/mark`,
        COMPANYTOGGLE:(id:string)=>`/admin/company-requests/${id}/toggle-active`,
        SUBSCRIPTION_CREATE: '/admin/company-requests/subscription',
        SUBSCRIPTION_LIST: '/admin/company-requests/subscription',
        SUBSCRIPTION_TOGGLE: (id: string) => `/admin/company-requests/subscription/${id}/toggle-active`,
        SUBSCRIPTION_UPDATE: (id: string) => `/admin/company-requests/subscription/${id}`,
    },
    INTERVIEWS: {
        ROOM: (interviewId: string) => `/interviews/${interviewId}/room`,
        UPDATE_STATUS: (interviewId: string) => `/interviews/${interviewId}/status`,
    },
    COMPILER: {
        LANGUAGES: "/compiler/languages",
        EXECUTE: "/compiler/execute",
    },
    INTERVIEWER: {
        PROFILE: '/interviewer/profile',
        ASSIGNMENTS: '/interviewer/assignments',
        SLOTS: '/interviewer/slots',
        ACCEPT: (interviewId: string) => `/interviewer/assignments/${interviewId}/accept`,
        REJECT: (interviewId: string) => `/interviewer/assignments/${interviewId}/reject`,
        COMPLETED: '/interviewer/completed-interviews',
        SUBMIT_FEEDBACK: (interviewId: string) => `/interviewer/interviews/${interviewId}/feedback`,
    },
    CANDIDATE: {
        PROFILE: '/candidate/profile',
        GETALL: '/candidate/list',
        JOBS: '/candidate/jobs',
        APPLY: (jobId: string) => `/candidate/jobs/${jobId}/apply`,
        MY_APPLICATIONS: '/candidate/applications/my',
        MY_INTERVIEWS: '/candidate/interviews/my',
        REQUEST_RESCHEDULE: (interviewId: string) => `/candidate/interviews/${interviewId}/reschedule`,
        INTERVIEW_FEEDBACKS: '/candidate/interviews/feedbacks',
        NOTIFICATIONS: {
            LIST: '/candidate/notifications',
            MARK_READ: (notificationId: string) => `/candidate/notifications/${notificationId}/read`,
            DELETE: (notificationId: string) => `/candidate/notifications/${notificationId}`,
        },
    },
} as const;

export type EmployerBase = "company" | "hr";

export const APP_ROUTES = {
    ROOT: '/',
    LOGIN: '/login',
    RESET_PASSWORD: '/reset-password',
    COMPANY_DASHBOARD: '/company/dashboard',
    JOBS_PATH: (base: EmployerBase) => `/${base}/jobs`,
    JOBS_EDIT_PATH: (base: EmployerBase, jobId: string) => `/${base}/jobs/${jobId}/edit`,
    JOBS_APPLICATIONS_PATH: (base: EmployerBase, jobId: string) => `/${base}/jobs/${jobId}/applications`,
    APPLICATIONS_PATH: (base: EmployerBase) => `/${base}/applications`,
    COMPANY_APPROVAL_PENDING: '/company/approval-pending',
    COMPANY_APPROVAL_FORM: '/company/approval-form',
    CANDIDATE_INTERVIEWS:"/candidate/interviews",
    INTERVIEW_ROOM: (interviewId: string) => `/interviews/${interviewId}/room`,
    CANDIDATE_PROFILE: '/candidate/profile',
    HR_DASHBOARD: '/hr/dashboard',
    ADMIN_DASHBOARD: '/admin',
    INTERVIEWER_DASHBOARD: '/interviewer/dashboard',
    INTERVIEWER_ASSIGNMENTS: '/interviewer/assignments',
    INTERVIEWER_SLOTS: '/interviewer/slots',
    INTERVIEWER_PROFILE: '/interviewer/profile',
} as const;

