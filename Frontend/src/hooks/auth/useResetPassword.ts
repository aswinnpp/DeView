import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApi } from '../useApi';
import { validatePassword, validateConfirmPassword, validateEmail } from '../../utils/validation/authValidation';


interface ResetPasswordRequest {
    email: string;
    newPassword: string;
}

interface ResetPasswordResponse {
    message: string;
}

interface FormData {
    newPassword: string;
    confirmPassword: string;
}

interface FormErrors {
    newPassword: string;
    confirmPassword: string;
}

interface UseResetPasswordReturn {
    formData: FormData;
    showNewPassword: boolean;
    showConfirmPassword: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    serverError: string | null;
    errors: FormErrors;
    paramError: string | null;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    toggleNewPasswordVisibility: () => void;
    toggleConfirmPasswordVisibility: () => void;
}


export function useResetPassword(): UseResetPasswordReturn {
    const location = useLocation();

    const [formData, setFormData] = useState<FormData>({
        newPassword: '',
        confirmPassword: '',
    });

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({ newPassword: '', confirmPassword: '' });
    const [paramError, setParamError] = useState<string | null>(null);

    const email = (location.state as { email?: string })?.email ||
        sessionStorage.getItem('resetEmail') || '';

    const { loading: isLoading, execute, error: serverError } = useApi<ResetPasswordResponse>(
        '/auth/reset-password',
        'POST'
    );

    useEffect(() => {
        if (!email) {
            setParamError('Reset session expired. Please request a new password reset.');
        }
    }, [email]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear the error for the field being edited
        setErrors(prev => ({ ...prev, [name]: '' }));
    }, []);

    const toggleNewPasswordVisibility = useCallback(() => {
        setShowNewPassword(prev => !prev);
    }, []);

    const toggleConfirmPasswordVisibility = useCallback(() => {
        setShowConfirmPassword(prev => !prev);
    }, []);

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        const emailCheck = validateEmail(email);
        if (!emailCheck.isValid) {
            setParamError('Reset session expired. Please request a new password reset.');
            return;
        }

        const passwordCheck = validatePassword(formData.newPassword);
        const confirmCheck = validateConfirmPassword(formData.newPassword, formData.confirmPassword);

        const newErrors: FormErrors = {
            newPassword: passwordCheck.isValid ? '' : (passwordCheck.error || ''),
            confirmPassword: confirmCheck.isValid ? '' : (confirmCheck.error || ''),
        };

        setErrors(newErrors);

        if (!passwordCheck.isValid || !confirmCheck.isValid) {
            return;
        }

        const result = await execute({
            data: {
                email,
                newPassword: formData.newPassword
            } as ResetPasswordRequest,
        });

        if (result) {
            sessionStorage.removeItem('resetEmail');
            setIsSuccess(true);
        }
    };

    return {
        formData,
        showNewPassword,
        showConfirmPassword,
        isLoading,
        isSuccess,
        serverError,
        errors,
        paramError,
        handleInputChange,
        handleSubmit,
        toggleNewPasswordVisibility,
        toggleConfirmPasswordVisibility,
    };
}
