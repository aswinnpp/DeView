import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../useApi';
import { validateEmail } from '../../utils/validation/authValidation';


interface ForgotPasswordRequest {
    email: string;
}

interface ForgotPasswordResponse {
    message: string;
}

interface UseForgotPasswordReturn {
    email: string;
    isLoading: boolean;
    serverError: string | null;
    validationError: string | null;
    successMessage: string | null;
    handleEmailSubmit: (e: React.FormEvent) => Promise<void>;
    handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}


export function useForgotPassword(): UseForgotPasswordReturn {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { loading: isLoading, execute, error: serverError } = useApi<ForgotPasswordResponse>(
        '/auth/forgot-password',
        'POST'
    );

    const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setValidationError(null);
    }, []);

    const handleEmailSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setSuccessMessage(null);

        const emailCheck = validateEmail(email);
        if (!emailCheck.isValid) {
            setValidationError(emailCheck.error);
            return;
        }

        const result = await execute({
            data: { email } as ForgotPasswordRequest,
        });

        if (result) {
            sessionStorage.setItem('resetEmail', email);
            setSuccessMessage(result.message || 'Reset code sent to your email!');

            setTimeout(() => {
                navigate('/verify-email?mode=password-reset', { state: { email } });
            }, 1500);
        }
    };

    return {
        email,
        isLoading,
        serverError,
        validationError,
        successMessage,
        handleEmailSubmit,
        handleEmailChange
    };
}
