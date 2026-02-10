import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm, type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '../useApi';
import { setUser } from '../../context/authSlice';
import type { AppDispatch } from '../../context/store';

interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    user: {
        id: string;
        fullName: string;
        email: string;
        role: string;
    };
    // No tokens in response! They're in HTTP-only cookies
}

interface CompanyApprovalCheckResponse {
    exists: boolean;
    status: 'not_found' | 'pending' | 'approved' | 'rejected';
    companyName?: string;
    rejectionReason?: string;
}

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

interface UseLoginData {
    form: UseFormReturn<LoginFormValues>;
    onSubmit: SubmitHandler<LoginFormValues>;
    showPassword: boolean;
    togglePasswordVisibility: () => void;
}

interface UseLoginReturn {
    isLoading: boolean;
    error: string | null;
    data: UseLoginData;
}


export function useLogin(): UseLoginReturn {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { loading: isLoading, execute, error: serverError } = useApi<LoginResponse>('/auth/login', 'POST');
    const { execute: checkCompanyApproval } = useApi<CompanyApprovalCheckResponse>('/company/check-status', 'POST');

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onSubmit',
    });

    // Fold API errors into the single error state exposed by this hook.
    useEffect(() => {
        if (serverError) setError(serverError);
    }, [serverError]);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    // Handle company role navigation based on approval status
    const handleCompanyNavigation = async (userId: string): Promise<void> => {
        try {
            // POST request with userId to check company approval status
            const result = await checkCompanyApproval({
                data: { userId }
            });

            if (result) {
                switch (result.status) {
                    case 'approved':
                        navigate('/company/dashboard');
                        break;
                    case 'pending':
                        navigate('/company/approval-pending');
                        break;
                    case 'rejected':
                        navigate('/company/approval-pending');
                        break;
                    case 'not_found':
                    default:
                        // No approval request found - go to form
                        navigate('/company/approval-form');
                        break;
                }
            } else {
                // No response - assume not found, go to form
                navigate('/company/approval-form');
            }
        } catch (error) {
            // Error checking approval - navigate to form
            console.error('Error checking company approval:', error);
            navigate('/company/approval-form');
        }
    };

    const onSubmit: SubmitHandler<LoginFormValues> = async (values: LoginFormValues) => {
        setError(null);

        const result = await execute({
            data: { email: values.email, password: values.password } satisfies LoginRequest,
        });

        if (result) {
            // Store user info in Redux (tokens are in HTTP-only cookies!)
            dispatch(setUser(result.user));

            const { role, id: userId } = result.user;

            // Small delay to ensure cookies are set
            setTimeout(async () => {
                if (role === 'candidate') {
                    navigate('/candidate/profile');
                } else if (role === 'company') {
                    // Check company approval status with userId
                    await handleCompanyNavigation(userId);
                } else if (role === 'hr') {
                    navigate('/hr/dashboard');
                } else if (role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            }, 500);
        }
    };

    return {
        isLoading,
        error,
        data: {
            form,
            showPassword,
            togglePasswordVisibility,
            onSubmit,
        },
    };
}
