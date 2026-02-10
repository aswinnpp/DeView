import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '../useApi';



interface ForgotPasswordResponse {
    message: string;
}

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

interface UseForgotPasswordData {
    form: UseFormReturn<ForgotPasswordFormValues>;
    onSubmit: SubmitHandler<ForgotPasswordFormValues>;
}

interface UseForgotPasswordReturn {
    isLoading: boolean;
    error: string | null;
    data: UseForgotPasswordData;
}


export function useForgotPassword(): UseForgotPasswordReturn {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const { loading: isLoading, execute, error: serverError } = useApi<ForgotPasswordResponse>(
        '/auth/forgot-password',
        'POST'
    );

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
        mode: 'onSubmit',
    });

    useEffect(() => {
        if (serverError) setError(serverError);
    }, [serverError]);

    const onSubmit: SubmitHandler<ForgotPasswordFormValues> = async ({ email }) => {
        setError(null);

        const result = await execute({
            data: { email }
        });

        if (result) {
            localStorage.setItem('pendingResetEmail', email);
            navigate('/verify-email?mode=password-reset', { state: { email } });
        }
    };

    return {
        isLoading,
        error,
        data: {
            form,
            onSubmit,
        },
    };
}
