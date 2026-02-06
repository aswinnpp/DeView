import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOtp } from './useOtp';
import { validateOtp, validateEmail } from '../../utils/validation/authValidation';


interface UseEmailVerificationReturn {
    otpCode: string;
    successMessage: string | null;
    serverError: string | null;
    validationError: string | null;
    mode: 'email-verification' | 'password-reset';
    userEmail: string;
    isVerifying: boolean;
    isResending: boolean;
    handleVerifyOtp: (e: React.FormEvent) => Promise<void>;
    handleResendOtp: () => Promise<boolean>;
    handleOtpChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}


export function useEmailVerification(initialEmail: string = ''): UseEmailVerificationReturn {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const modeParam = searchParams.get('mode');
    const mode: 'email-verification' | 'password-reset' =
        modeParam === 'password-reset' ? 'password-reset' : 'email-verification';

    const sessionEmail = sessionStorage.getItem('verificationEmail') ||
        sessionStorage.getItem('resetEmail') || '';
    const userEmail = initialEmail || sessionEmail;

    const [otpCode, setOtpCode] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isResending, setIsResending] = useState(false);

    const { verifyOtp, verifyPasswordResetOtp, resendOtp, resendPasswordResetOtp, loading: isVerifying, serverError } = useOtp();

    const handleOtpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 6) {
            setOtpCode(value);
            setValidationError(null);
        }
    }, []);

    const handleVerifyOtp = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setSuccessMessage(null);

        const emailCheck = validateEmail(userEmail);
        if (!emailCheck.isValid) {
            setValidationError(emailCheck.error);
            return;
        }

        const otpCheck = validateOtp(otpCode);
        if (!otpCheck.isValid) {
            setValidationError(otpCheck.error);
            return;
        }

        // Use different endpoint based on mode
        const success = mode === 'password-reset'
            ? await verifyPasswordResetOtp(userEmail, otpCode)
            : await verifyOtp(userEmail, otpCode);

        if (success) {
            setSuccessMessage('Verification successful!');

            sessionStorage.removeItem('verificationEmail');
            sessionStorage.removeItem('resetEmail');

            if (mode === 'password-reset') {
                // Store OTP in sessionStorage for reset password page
                sessionStorage.setItem('resetOtp', otpCode);
                setTimeout(() => {
                    navigate('/reset-password', {
                        state: { email: userEmail, otp: otpCode, verified: true }
                    });
                }, 1000);
            } else {
                setTimeout(() => {
                    navigate('/login', {
                        state: { message: 'Email verified! You can now login.' }
                    });
                }, 1000);
            }
        }
    };

    const handleResendOtp = async (): Promise<boolean> => {
        if (isResending) return false;

        setIsResending(true);
        setValidationError(null);
        setSuccessMessage(null);

        const emailCheck = validateEmail(userEmail);
        if (!emailCheck.isValid) {
            setValidationError(emailCheck.error);
            setIsResending(false);
            return false;
        }

        // Use different endpoint based on mode
        const success = mode === 'password-reset'
            ? await resendPasswordResetOtp(userEmail)
            : await resendOtp(userEmail);

        if (success) {
            setSuccessMessage('OTP resent successfully!');
        }

        setIsResending(false);
        return success;
    };

    return {
        otpCode,
        successMessage,
        serverError,
        validationError,
        mode,
        userEmail,
        isVerifying,
        isResending,
        handleVerifyOtp,
        handleResendOtp,
        handleOtpChange,
    };
}
