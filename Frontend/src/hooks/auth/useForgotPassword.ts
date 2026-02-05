import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../useApi';

// ===========================================
// TYPES
// ===========================================

interface ForgotPasswordRequest {
    email: string;
}

interface ForgotPasswordResponse {
    message: string;
}

interface UseForgotPasswordReturn {
    email: string;
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
    handleEmailSubmit: (e: React.FormEvent) => Promise<void>;
    handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// ===========================================
// HOOK
// ===========================================

/**
 * useForgotPassword - Hook to handle forgot password flow
 * 
 * Usage:
 * const { email, isLoading, error, handleEmailSubmit, handleEmailChange } = useForgotPassword();
 */
export function useForgotPassword(): UseForgotPasswordReturn {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { loading: isLoading, execute, error: apiError } = useApi<ForgotPasswordResponse>(
        '/auth/forgot-password',
        'POST'
    );

    // Handle email input change
    const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setError(null);
    }, []);

    // Handle form submit
    const handleEmailSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        // Validate email
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        const result = await execute({
            data: { email } as ForgotPasswordRequest,
        });

        if (result) {
            // Store email for reset password page
            sessionStorage.setItem('resetEmail', email);

            setSuccessMessage(result.message || 'Reset code sent to your email!');

            // Navigate to email verification page with password-reset mode
            setTimeout(() => {
                navigate('/verify-email?mode=password-reset', { state: { email } });
            }, 1500);
        } else {
            setError(apiError || 'Failed to send reset email. Please try again.');
        }
    };

    return {
        email,
        isLoading,
        error: error || apiError,
        successMessage,
        handleEmailSubmit,
        handleEmailChange
    };
}
