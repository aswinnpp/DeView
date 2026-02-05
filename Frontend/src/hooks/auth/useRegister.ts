import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../useApi';

// ===========================================
// TYPES
// ===========================================

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

interface FormData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

interface UseRegisterReturn {
    // Role selection
    selectedRole: 'candidate' | 'company' | null;
    handleRolePick: (role: 'candidate' | 'company') => void;

    // Form state
    formData: FormData;
    errors: FormErrors;

    // Password visibility
    showPassword: boolean;
    showConfirmPassword: boolean;

    // Loading & errors
    loading: boolean;
    apiLoading: boolean;
    serverError: string | null;

    // Handlers
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    togglePasswordVisibility: () => void;
    toggleConfirmPasswordVisibility: () => void;
}

// ===========================================
// HOOK
// ===========================================

/**
 * useRegister - Hook to handle user registration with all form logic
 * 
 * Usage:
 * const { formData, handleInputChange, handleSubmit, ... } = useRegister();
 */
export function useRegister(): UseRegisterReturn {
    const navigate = useNavigate();

    // Selected role state
    const [selectedRole, setSelectedRole] = useState<'candidate' | 'company' | null>(null);

    // Form state
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    // Password visibility states
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form validation errors
    const [errors, setErrors] = useState<FormErrors>({});

    // Local loading state
    const [loading, setLoading] = useState(false);

    // Use our API hook for registration
    const { loading: apiLoading, execute, error: serverError } = useApi<RegisterResponse>('/auth/register', 'POST');

    // Handle role selection
    const handleRolePick = useCallback((role: 'candidate' | 'company') => {
        setSelectedRole(role);
        // Clear form when switching roles
        setFormData({
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
        });
        setErrors({});
    }, []);

    // Handle input changes
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear specific error when typing
        setErrors((prev) => ({
            ...prev,
            [name]: undefined,
        }));
    }, []);

    // Toggle password visibility
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    const toggleConfirmPasswordVisibility = useCallback(() => {
        setShowConfirmPassword((prev) => !prev);
    }, []);

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Validate name
        if (!formData.fullName || formData.fullName.trim().length < 2) {
            newErrors.fullName = selectedRole === 'company' ? 'Company name is required' : 'Full name is required';
        }

        // Validate email
        if (!formData.email || !formData.email.includes('@')) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Validate password
        if (!formData.password || formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Validate confirm password
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (!validateForm() || !selectedRole) {
            return;
        }

        setLoading(true);

        const result = await execute({
            data: {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: selectedRole,
            } as RegisterRequest,
        });

        setLoading(false);

        if (result) {
            // Store email for verification page
            sessionStorage.setItem('verificationEmail', formData.email);

            // Navigate to email verification page
            navigate('/verify-email', {
                state: { email: formData.email }
            });
        }
        // Error is handled by the hook's serverError
    };

    return {
        selectedRole,
        handleRolePick,
        formData,
        errors,
        showPassword,
        showConfirmPassword,
        loading,
        apiLoading,
        serverError,
        handleInputChange,
        handleSubmit,
        togglePasswordVisibility,
        toggleConfirmPasswordVisibility,
    };
}
