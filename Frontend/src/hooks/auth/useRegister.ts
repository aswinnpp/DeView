import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '../useApi';

interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
    role: 'candidate' | 'company';
}

interface RegisterResponse {
    message: string;
    userId?: string;
}

const registerSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['candidate', 'company']),
}).refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

interface UseRegisterData {
    form: UseFormReturn<RegisterFormValues>;
    onSubmit: SubmitHandler<RegisterFormValues>;
}

interface UseRegisterReturn {
    isLoading: boolean;
    error: string | null;
    data: UseRegisterData;
}


export function useRegister(): UseRegisterReturn {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const { loading: isLoading, execute, error: serverError } = useApi<RegisterResponse>('/auth/register', 'POST');

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'candidate',
        },
        mode: 'onSubmit',
    });

    useEffect(() => {
        if (serverError) setError(serverError);
    }, [serverError]);

    const onSubmit: SubmitHandler<RegisterFormValues> = async (values: RegisterFormValues) => {
        setError(null);

        const result = await execute({
            data: {
                fullName: values.fullName,
                email: values.email,
                password: values.password,
                role: values.role as 'candidate' | 'company',
            } as RegisterRequest,
        });

        if (result) {
            localStorage.setItem('pendingVerificationEmail', values.email);
            navigate('/verify-email', {
                state: { email: values.email }
            });
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
