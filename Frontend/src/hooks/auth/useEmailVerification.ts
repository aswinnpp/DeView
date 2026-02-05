import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOtp } from './useOtp';

// ===========================================
// TYPES
// ===========================================

interface UseEmailVerificationReturn {
    otpCode: string;
    successMessage: string | null;
    errorMessage: string | null;
    mode: 'email-verification' | 'password-reset';
    userEmail: string;
    isVerifying: boolean;
    isResending: boolean;
    handleVerifyOtp: (e: React.FormEvent) => Promise<void>;
    handleResendOtp: () => Promise<boolean>;
    handleOtpChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// ===========================================
// HOOK
// ===========================================

/**
 * useEmailVerification - Hook for email verification page
 * 
 * Usage:
 * const { otpCode, handleVerifyOtp, handleOtpChange, ... } = useEmailVerification(email);
 */
export function useEmailVerification(initialEmail: string = ''): UseEmailVerificationReturn {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Get mode from URL params or default to email verification
    const modeParam = searchParams.get('mode');
    const mode: 'email-verification' | 'password-reset' =
        modeParam === 'password-reset' ? 'password-reset' : 'email-verification';

    // Get email from props, session storage, or URL params
    const sessionEmail = sessionStorage.getItem('verificationEmail') ||
        sessionStorage.getItem('resetEmail') || '';
    const userEmail = initialEmail || sessionEmail;

    // Local state
    const [otpCode, setOtpCode] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isResending, setIsResending] = useState(false);

    // Use OTP hook
    const { verifyOtp, resendOtp, loading: isVerifying, error: otpError } = useOtp();

    // Handle OTP input change
    const handleOtpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Only digits
        if (value.length <= 4) {
            setOtpCode(value);
            setErrorMessage(null);
        }
    }, []);

    // Handle OTP verification
    const handleVerifyOtp = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!userEmail) {
            setErrorMessage('No email found. Please try again.');
            return;
        }

        if (otpCode.length !== 4) {
            setErrorMessage('Please enter a 4-digit OTP');
            return;
        }

        const success = await verifyOtp(userEmail, otpCode);

        if (success) {
            setSuccessMessage('Verification successful!');

            // Clear stored email
            sessionStorage.removeItem('verificationEmail');
            sessionStorage.removeItem('resetEmail');

            if (mode === 'password-reset') {
                // Navigate to reset password page
                setTimeout(() => {
                    navigate('/reset-password', {
                        state: { email: userEmail, verified: true }
                    });
                }, 1000);
            } else {
                // Navigate to login page
                setTimeout(() => {
                    navigate('/login', {
                        state: { message: 'Email verified! You can now login.' }
                    });
                }, 1000);
            }
        } else {
            setErrorMessage(otpError || 'Invalid OTP. Please try again.');
        }
    };

    // Handle resend OTP
    const handleResendOtp = async (): Promise<boolean> => {
        if (isResending) return false;

        setIsResending(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!userEmail) {
            setErrorMessage('No email found. Please try again.');
            setIsResending(false);
            return false;
        }

        const success = await resendOtp(userEmail);

        if (success) {
            setSuccessMessage('OTP resent successfully!');
        } else {
            setErrorMessage('Failed to resend OTP. Please try again.');
        }

        setIsResending(false);
        return success;
    };

    return {
        otpCode,
        successMessage,
        errorMessage: errorMessage || otpError,
        mode,
        userEmail,
        isVerifying,
        isResending,
        handleVerifyOtp,
        handleResendOtp,
        handleOtpChange,
    };
}
