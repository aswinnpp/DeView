import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../useApi';
import { setAuthToken, setRefreshToken, setUser } from '../../utils/auth';

// ===========================================
// TYPES
// ===========================================

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
    accessToken: string;
    refreshToken: string;
}

interface FormData {
    email: string;
    password: string;
}

interface UseLoginReturn {
    // Form state
    formData: FormData;
    showPassword: boolean;

    // Loading & errors
    isLoading: boolean;
    displayError: string | null;
    displaySuccess: string | null;

    // Handlers
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    togglePasswordVisibility: () => void;
}

// ===========================================
// HOOK
// ===========================================

/**
 * useLogin - Hook to handle user login with all form logic
 * 
 * Usage:
 * const { formData, handleInputChange, handleSubmit, ... } = useLogin();
 */
export function useLogin(): UseLoginReturn {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
    });

    // Password visibility
    const [showPassword, setShowPassword] = useState(false);

    // Display states
    const [displayError, setDisplayError] = useState<string | null>(null);
    const [displaySuccess, setDisplaySuccess] = useState<string | null>(null);

    // Use our API hook for login
    const { loading: isLoading, execute, error: apiError } = useApi<LoginResponse>('/auth/login', 'POST');

    // Handle input changes
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear errors when typing
        setDisplayError(null);
    }, []);

    // Toggle password visibility
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setDisplayError(null);
        setDisplaySuccess(null);

        // Basic validation
        if (!formData.email || !formData.password) {
            setDisplayError('Please fill in all fields');
            return;
        }

        // Call the API
        const result = await execute({
            data: { email: formData.email, password: formData.password } as LoginRequest,
        });

        if (result) {
            // Save the tokens
            setAuthToken(result.accessToken);
            setRefreshToken(result.refreshToken);
            setUser(result.user);

            setDisplaySuccess('Login successful!');

            // Redirect based on role
            const role = result.user.role;
            setTimeout(() => {
                if (role === 'candidate') {
                    navigate('/');
                } else if (role === 'company') {
                    navigate('/company/dashboard');
                } else if (role === 'hr') {
                    navigate('/hr/dashboard');
                } else if (role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            }, 500);
        } else {
            setDisplayError(apiError || 'Invalid email or password');
        }
    };

    return {
        formData,
        showPassword,
        isLoading,
        displayError,
        displaySuccess,
        handleInputChange,
        handleSubmit,
        togglePasswordVisibility,
    };
}
