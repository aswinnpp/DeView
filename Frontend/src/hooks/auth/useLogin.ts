import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useApi } from '../useApi';
import { validateEmail, validatePassword } from '../../utils/validation/authValidation';
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

interface FormData {
    email: string;
    password: string;
}

interface UseLoginReturn {
    formData: FormData;
    showPassword: boolean;
    isLoading: boolean;
    serverError: string | null;
    validationError: string | null;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    togglePasswordVisibility: () => void;
}


export function useLogin(): UseLoginReturn {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const { loading: isLoading, execute, error: serverError } = useApi<LoginResponse>('/auth/login', 'POST');
    const { execute: checkCompanyApproval } = useApi<CompanyApprovalCheckResponse>('/company/check-status', 'POST');

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setValidationError(null);
    }, []);

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

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

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        const emailCheck = validateEmail(formData.email);
        if (!emailCheck.isValid) {
            setValidationError(emailCheck.error);
            return;
        }

        const passwordCheck = validatePassword(formData.password);
        if (!passwordCheck.isValid) {
            setValidationError(passwordCheck.error);
            return;
        }

        const result = await execute({
            data: { email: formData.email, password: formData.password } as LoginRequest,
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
        formData,
        showPassword,
        isLoading,
        serverError,
        validationError,
        handleInputChange,
        handleSubmit,
        togglePasswordVisibility,
    };
}
