import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApi } from '../useApi';

// ===========================================
// TYPES
// ===========================================

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
    newPassword?: string;
    confirmPassword?: string;
}

interface UseResetPasswordReturn {
    formData: FormData;
    showNewPassword: boolean;
    showConfirmPassword: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    errors: FormErrors;
    paramError: string | null;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    toggleNewPasswordVisibility: () => void;
    toggleConfirmPasswordVisibility: () => void;
}

// ===========================================
// HOOK
// ===========================================

/**
 * useResetPassword - Hook to handle password reset flow
 * 
 * Usage:
 * const { formData, handleInputChange, handleSubmit, ... } = useResetPassword();
 */
export function useResetPassword(): UseResetPasswordReturn {
    const location = useLocation();

    // Form state
    const [formData, setFormData] = useState<FormData>({
        newPassword: '',
        confirmPassword: '',
    });

    // Password visibility
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Success state
    const [isSuccess, setIsSuccess] = useState(false);

    // Errors
    const [errors, setErrors] = useState<FormErrors>({});
    const [paramError, setParamError] = useState<string | null>(null);

    // Get email from location state or session storage
    const email = (location.state as { email?: string })?.email ||
        sessionStorage.getItem('resetEmail') || '';

    // Note: User should come from verification page (password reset flow)

    // API hook
    const { loading: isLoading, execute, error: apiError } = useApi<ResetPasswordResponse>(
        '/auth/reset-password',
        'POST'
    );

    // Check for missing email on mount
    useEffect(() => {
        if (!email) {
            setParamError('Reset session expired. Please request a new password reset.');
        }
    }, [email]);

    // Handle input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field
        setErrors(prev => ({
            ...prev,
            [name]: undefined,
        }));
    }, []);

    // Toggle password visibility
    const toggleNewPasswordVisibility = useCallback(() => {
        setShowNewPassword(prev => !prev);
    }, []);

    const toggleConfirmPasswordVisibility = useCallback(() => {
        setShowConfirmPassword(prev => !prev);
    }, []);

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.newPassword || formData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }

        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!email) {
            setParamError('Reset session expired. Please request a new password reset.');
            return;
        }

        const result = await execute({
            data: {
                email,
                newPassword: formData.newPassword
            } as ResetPasswordRequest,
        });

        if (result) {
            // Clear stored email
            sessionStorage.removeItem('resetEmail');

            setIsSuccess(true);
        } else {
            setErrors({
                newPassword: apiError || 'Failed to reset password. Please try again.',
            });
        }
    };

    return {
        formData,
        showNewPassword,
        showConfirmPassword,
        isLoading,
        isSuccess,
        errors,
        paramError,
        handleInputChange,
        handleSubmit,
        toggleNewPasswordVisibility,
        toggleConfirmPasswordVisibility,
    };
}
