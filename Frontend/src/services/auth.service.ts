import { api } from '../api/axios';
import { API_ROUTES } from '../constants/routes';

// ─── Types ──────────────────────────────────────────────────────

export type LoginPayload = { email: string; password: string };
export type LoginResponse = {
    user: { id: string; fullName: string; email: string; role: string };
};

export type RegisterPayload = {
    fullName: string;
    email: string;
    password: string;
    role: string;
};
export type RegisterResponse = { message: string; userId?: string };

export type VerifyOtpPayload = { email: string; otp: string };
export type VerifyOtpResponse = { success?: boolean; message?: string; valid?: boolean };

export type ResendOtpPayload = { email: string };
export type ResendOtpResponse = { message: string; email?: string };

export type ForgotPasswordPayload = { email: string };
export type ForgotPasswordResponse = { message: string };

export type ResetPasswordPayload = { email: string; otp: string; newPassword: string };
export type ResetPasswordResponse = { message: string };

export type GoogleExchangeResponse = {
    user: { id: string; fullName: string; email: string; role: string };
    role: string;
};

export type CompanyStatusPayload = { userId: string };
export type CompanyStatusResponse = {
    exists: boolean;
    status: 'not_found' | 'pending' | 'approved' | 'rejected';
    companyName?: string;
    rejectionReason?: string;
};

// ─── Service functions ──────────────────────────────────────────

export const authService = {
    login(data: LoginPayload) {
        return api.post<LoginResponse>(API_ROUTES.AUTH.LOGIN, data);
    },

    register(data: RegisterPayload) {
        return api.post<RegisterResponse>(API_ROUTES.AUTH.REGISTER, data);
    },

    verifyOtp(url: string, data: VerifyOtpPayload) {
        return api.post<VerifyOtpResponse>(url, data);
    },

    resendOtp(url: string, data: ResendOtpPayload) {
        return api.post<ResendOtpResponse>(url, data);
    },

    forgotPassword(data: ForgotPasswordPayload) {
        return api.post<ForgotPasswordResponse>(API_ROUTES.AUTH.FORGOT_PASSWORD, data);
    },

    resetPassword(data: ResetPasswordPayload) {
        return api.post<ResetPasswordResponse>(API_ROUTES.AUTH.RESET_PASSWORD, data);
    },

    googleExchange(sessionId: string) {
        return api.get<GoogleExchangeResponse>(API_ROUTES.AUTH.GOOGLE_EXCHANGE, {
            params: { sessionId },
        });
    },

    checkCompanyStatus(data: CompanyStatusPayload) {
        return api.post<CompanyStatusResponse>(API_ROUTES.COMPANY.CHECK_STATUS, data);
    },

    logout() {
        return api.post(API_ROUTES.AUTH.LOGOUT);
    },
};
