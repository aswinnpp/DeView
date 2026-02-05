import { useState, useCallback } from 'react';
import { useApi } from '../useApi';

// ===========================================
// TYPES
// ===========================================

interface VerifyOTPRequest {
    email: string;
    otp: string;
}

interface VerifyOTPResponse {
    message: string;
}

interface ResendOTPRequest {
    email: string;
}

interface ResendOTPResponse {
    message: string;
}

interface UseOtpReturn {
    verifyOtp: (email: string, otp: string) => Promise<boolean>;
    resendOtp: (email: string) => Promise<boolean>;
    loading: boolean;
    error: string | null;
    successMessage: string | null;
}

// ===========================================
// HOOK
// ===========================================

/**
 * useOtp - Hook to handle OTP verification and resend
 * 
 * Usage:
 * const { verifyOtp, resendOtp, loading, error, successMessage } = useOtp();
 * const success = await verifyOtp(email, otp);
 */
export function useOtp(): UseOtpReturn {
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // API hooks
    const verifyApi = useApi<VerifyOTPResponse>('/auth/verify-otp', 'POST');
    const resendApi = useApi<ResendOTPResponse>('/auth/resend-otp', 'POST');

    // Combined loading state
    const loading = verifyApi.loading || resendApi.loading;

    // Verify OTP
    const verifyOtp = useCallback(async (email: string, otp: string): Promise<boolean> => {
        setError(null);
        setSuccessMessage(null);

        // Validate OTP
        if (!otp || otp.length !== 4) {
            setError('Please enter a valid 4-digit OTP');
            return false;
        }

        const result = await verifyApi.execute({
            data: { email, otp } as VerifyOTPRequest,
        });

        if (result) {
            setSuccessMessage(result.message || 'Email verified successfully!');
            return true;
        }

        setError(verifyApi.error || 'Invalid OTP. Please try again.');
        return false;
    }, [verifyApi]);

    // Resend OTP
    const resendOtp = useCallback(async (email: string): Promise<boolean> => {
        setError(null);
        setSuccessMessage(null);

        const result = await resendApi.execute({
            data: { email } as ResendOTPRequest,
        });

        if (result) {
            setSuccessMessage(result.message || 'OTP sent successfully!');
            return true;
        }

        setError(resendApi.error || 'Failed to resend OTP. Please try again.');
        return false;
    }, [resendApi]);

    return { verifyOtp, resendOtp, loading, error, successMessage };
}
