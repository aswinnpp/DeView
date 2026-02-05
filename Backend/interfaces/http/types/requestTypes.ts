// Re-export application DTOs for use in controllers
// This keeps type safety while avoiding duplication

// ==========================================
// Auth Request Types
// ==========================================
export { RegisterUserRequestDTO as RegisterBody } from '../../../application/auth/dtos/RegisterUserRequestDTO.js';
export { LoginRequestDTO as LoginBody } from '../../../application/auth/dtos/LoginRequestDTO.js';

export interface VerifyOTPBody {
    email: string;
    otp: string;
}

export interface ResendOTPBody {
    email: string;
}

export interface ForgotPasswordBody {
    email: string;
}

export interface ResetPasswordBody {
    email: string;
    otp: string;
    newPassword: string;
}

// ==========================================
// Route Params Types
// ==========================================
export interface IdParams {
    id: string;
}
