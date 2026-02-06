import { useState, useCallback } from 'react';
import { useApi } from '../useApi';
import { validateOtp } from '../../utils/validation/authValidation';


interface VerifyOTPRequest {
    email: string;
    otp: string;
}

interface VerifyOTPResponse {
    message: string;
}

interface VerifyPasswordResetOTPResponse {
    valid: boolean;
}

interface ResendOTPRequest {
    email: string;
}

interface ResendOTPResponse {
    message: string;
}

interface UseOtpReturn {
    verifyOtp: (email: string, otp: string) => Promise<boolean>;
    verifyPasswordResetOtp: (email: string, otp: string) => Promise<boolean>;
    resendOtp: (email: string) => Promise<boolean>;
    resendPasswordResetOtp: (email: string) => Promise<boolean>;
    loading: boolean;
    serverError: string | null;
    validationError: string | null;
    successMessage: string | null;
}


export function useOtp(): UseOtpReturn {
    const [validationError, setValidationError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const verifyApi = useApi<VerifyOTPResponse>('/auth/verify-otp', 'POST');
    const verifyPasswordResetApi = useApi<VerifyPasswordResetOTPResponse>('/auth/verify-password-reset-otp', 'POST');
    const resendApi = useApi<ResendOTPResponse>('/auth/resend-otp', 'POST');
    const resendPasswordResetApi = useApi<ResendOTPResponse>('/auth/forgot-password', 'POST');

    const loading = verifyApi.loading || verifyPasswordResetApi.loading || resendApi.loading || resendPasswordResetApi.loading;
    const serverError = verifyApi.error || verifyPasswordResetApi.error || resendApi.error || resendPasswordResetApi.error;

    const verifyOtp = useCallback(async (email: string, otp: string): Promise<boolean> => {
        setValidationError(null);
        setSuccessMessage(null);

        const otpCheck = validateOtp(otp);
        if (!otpCheck.isValid) {
            setValidationError(otpCheck.error);
            return false;
        }

        const result = await verifyApi.execute({
            data: { email, otp } as VerifyOTPRequest,
        });

        if (result) {
            setSuccessMessage(result.message || 'Email verified successfully!');
            return true;
        }

        return false;
    }, [verifyApi]);

    // Separate OTP verification for password reset (doesn't check if email is already verified)
    const verifyPasswordResetOtp = useCallback(async (email: string, otp: string): Promise<boolean> => {
        setValidationError(null);
        setSuccessMessage(null);

        const otpCheck = validateOtp(otp);
        if (!otpCheck.isValid) {
            setValidationError(otpCheck.error);
            return false;
        }

        const result = await verifyPasswordResetApi.execute({
            data: { email, otp } as VerifyOTPRequest,
        });

        if (result && result.valid) {
            setSuccessMessage('OTP verified successfully!');
            return true;
        }

        setValidationError('Invalid or expired OTP');
        return false;
    }, [verifyPasswordResetApi]);

    const resendOtp = useCallback(async (email: string): Promise<boolean> => {
        setValidationError(null);
        setSuccessMessage(null);

        const result = await resendApi.execute({
            data: { email } as ResendOTPRequest,
        });

        if (result) {
            setSuccessMessage(result.message || 'OTP sent successfully!');
            return true;
        }

        return false;
    }, [resendApi]);

    // Resend OTP for password reset (uses forgot-password endpoint)
    const resendPasswordResetOtp = useCallback(async (email: string): Promise<boolean> => {
        setValidationError(null);
        setSuccessMessage(null);

        const result = await resendPasswordResetApi.execute({
            data: { email } as ResendOTPRequest,
        });

        if (result) {
            setSuccessMessage(result.message || 'OTP sent successfully!');
            return true;
        }

        return false;
    }, [resendPasswordResetApi]);

    return { verifyOtp, verifyPasswordResetOtp, resendOtp, resendPasswordResetOtp, loading, serverError, validationError, successMessage };
}
