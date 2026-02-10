import { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { api } from '../useApi';
import { useForm, type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getErrorMessage } from '../../utils/validation/apiValidation';

interface VerifyEmailOtpResponse {
    message: string;
}

interface VerifyPasswordResetOtpResponse {
    valid: boolean;
}

interface ResendOtpResponse {
    message: string;
    email: string;
}

interface ForgotPasswordResponse {
    message: string;
}

const otpSchema = z.object({
    otpCode: z
        .string()
        .regex(/^\d{4}$/, 'OTP must be a 4-digit code'),
});

type OtpFormValues = z.infer<typeof otpSchema>;

interface UseEmailVerificationData {
    form: UseFormReturn<OtpFormValues>;
    mode: 'email-verification' | 'password-reset';
    userEmail: string;
    handleResendOtp: () => Promise<boolean>;
    onSubmit: SubmitHandler<OtpFormValues>;
}

interface UseEmailVerificationReturn {
    isLoading: boolean;
    error: string | null;
    data: UseEmailVerificationData;
}

export function useEmailVerification(): UseEmailVerificationReturn {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    // Determine flow mode
    const modeParam = searchParams.get('mode');
    const mode: 'email-verification' | 'password-reset' =
        modeParam === 'password-reset' ? 'password-reset' : 'email-verification';

    const locationState = location.state as { email?: string } | null;

    const storageKey = mode === 'password-reset' ? 'pendingResetEmail' : 'pendingVerificationEmail';
    const storedEmail = localStorage.getItem(storageKey);

    const userEmail = locationState?.email || storedEmail || '';

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<OtpFormValues>({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            otpCode: '',
        },
        mode: 'onSubmit',
    });

    const onSubmit: SubmitHandler<OtpFormValues> = async ({ otpCode }) => {
        setIsLoading(true);
        setError(null);

        if (!userEmail) {
            setError('Missing email for verification. Please restart the flow.');
            setIsLoading(false);
            return;
        }

        try {
            if (mode === 'password-reset') {
                const { data } = await api.post<VerifyPasswordResetOtpResponse>('/auth/verify-password-reset-otp', {
                    email: userEmail,
                    otp: otpCode,
                });

                if (!data.valid) {
                    setError('Incorrect OTP. Please try again.');
                    return;
                }

                // Clean up stored email on success
                localStorage.removeItem('pendingResetEmail');
                form.reset();
                setTimeout(() => {
                    navigate('/reset-password', {
                        state: { email: userEmail, otp: otpCode, verified: true },
                    });
                }, 1000);
            } else {
                await api.post<VerifyEmailOtpResponse>('/auth/verify-otp', {
                    email: userEmail,
                    otp: otpCode,
                });

                // Clean up stored email on success
                localStorage.removeItem('pendingVerificationEmail');
                form.reset();
                setTimeout(() => {
                    navigate('/login', {
                        state: { message: 'Email verified! You can now login.' },
                    });
                }, 1000);
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async (): Promise<boolean> => {
        if (isLoading) return false;
        setIsLoading(true);
        setError(null);

        if (!userEmail) {
            setError('Missing email. Please restart verification.');
            setIsLoading(false);
            return false;
        }

        try {
            if (mode === 'password-reset') {
                await api.post<ForgotPasswordResponse>('/auth/forgot-password', { email: userEmail });
            } else {
                await api.post<ResendOtpResponse>('/auth/resend-otp', { email: userEmail });
            }
            return true;
        } catch (err) {
            setError(getErrorMessage(err));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        data: {
            form,
            mode,
            userEmail,
            handleResendOtp,
            onSubmit,
        },
    };
}
