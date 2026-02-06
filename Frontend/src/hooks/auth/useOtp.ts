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
    serverError: string | null;
    validationError: string | null;
    successMessage: string | null;
}


export function useOtp(): UseOtpReturn {
    const [validationError, setValidationError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const verifyApi = useApi<VerifyOTPResponse>('/auth/verify-otp', 'POST');
    const resendApi = useApi<ResendOTPResponse>('/auth/resend-otp', 'POST');

    const loading = verifyApi.loading || resendApi.loading;
    const serverError = verifyApi.error || resendApi.error;

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

    return { verifyOtp, resendOtp, loading, serverError, validationError, successMessage };
}
