import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm, type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '../useApi';


interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
}

interface ResetPasswordResponse {
    message: string;
}

const resetPasswordSchema = z.object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface UseResetPasswordData {
    form: UseFormReturn<ResetPasswordFormValues>;
    showNewPassword: boolean;
    showConfirmPassword: boolean;
    isSuccess: boolean;
    paramError: string | null;
    onSubmit: SubmitHandler<ResetPasswordFormValues>;
    toggleNewPasswordVisibility: () => void;
    toggleConfirmPasswordVisibility: () => void;
}

interface UseResetPasswordReturn {
    isLoading: boolean;
    error: string | null;
    data: UseResetPasswordData;
}


export function useResetPassword(): UseResetPasswordReturn {
    const location = useLocation();

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [paramError, setParamError] = useState<string | null>(null);

    const locationState = location.state as { email?: string; otp?: string } | null;

    const storedEmail = localStorage.getItem('pendingResetEmail');

    const email = locationState?.email || storedEmail || '';
    const otp = locationState?.otp || '';

    const { loading: isLoading, execute, error: serverError } = useApi<ResetPasswordResponse>(
        '/auth/reset-password',
        'POST'
    );

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        },
        mode: 'onSubmit',
    });

    useEffect(() => {
        if (!email || !otp) {
            setParamError('Reset session expired. Please request a new password reset.');
        }
    }, [email, otp]);

    const toggleNewPasswordVisibility = useCallback(() => {
        setShowNewPassword(prev => !prev);
    }, []);

    const toggleConfirmPasswordVisibility = useCallback(() => {
        setShowConfirmPassword(prev => !prev);
    }, []);

    const onSubmit: SubmitHandler<ResetPasswordFormValues> = async ({ newPassword }) => {
        if (!email || !otp) {
            setParamError('Reset session expired. Please request a new password reset.');
            return;
        }

        const result = await execute({
            data: {
                email,
                otp,
                newPassword,
            } as ResetPasswordRequest,
        });

        if (result) {
            localStorage.removeItem('pendingResetEmail');
            setIsSuccess(true);
        }
    };

    return {
        isLoading,
        error: serverError,
        data: {
            showNewPassword,
            showConfirmPassword,
            isSuccess,
            paramError,
            form,
            onSubmit,
            toggleNewPasswordVisibility,
            toggleConfirmPasswordVisibility,
        },
    };
}
