import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../useApi';
import { validateEmail, validatePassword, validateConfirmPassword, validateName, validateRole } from '../../utils/validation/authValidation';


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
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface UseRegisterReturn {
    selectedRole: 'candidate' | 'company' | null;
    handleRolePick: (role: 'candidate' | 'company') => void;
    formData: FormData;
    errors: FormErrors;
    showPassword: boolean;
    showConfirmPassword: boolean;
    loading: boolean;
    apiLoading: boolean;
    serverError: string | null;
    validationError: string | null;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    togglePasswordVisibility: () => void;
    toggleConfirmPasswordVisibility: () => void;
}


export function useRegister(): UseRegisterReturn {
    const navigate = useNavigate();

    const [selectedRole, setSelectedRole] = useState<'candidate' | 'company' | null>(null);

    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const { loading, execute, error: serverError } = useApi<RegisterResponse>('/auth/register', 'POST');

    const clearErrors = useCallback(() => {
        setErrors({
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
        });
        setValidationError(null);
    }, []);

    const handleRolePick = useCallback((role: 'candidate' | 'company') => {
        setSelectedRole(role);
        setFormData({
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
        });
        clearErrors();
    }, [clearErrors]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear the error for this specific field
        setErrors((prev) => ({
            ...prev,
            [name]: '',
        }));
        setValidationError(null);
    }, []);

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    const toggleConfirmPasswordVisibility = useCallback(() => {
        setShowConfirmPassword((prev) => !prev);
    }, []);

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        // Clear previous errors
        clearErrors();

        // Create new errors object
        const newErrors: FormErrors = {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
        };
        let hasError = false;

        const roleCheck = validateRole(selectedRole);
        if (!roleCheck.isValid) {
            setValidationError(roleCheck.error || 'Please select a role');
            return;
        }

        const nameLabel = selectedRole === 'company' ? 'Company name' : 'Full name';
        const nameCheck = validateName(formData.fullName, nameLabel);
        if (!nameCheck.isValid) {
            newErrors.fullName = nameCheck.error || 'Name is required';
            hasError = true;
        }

        const emailCheck = validateEmail(formData.email);
        if (!emailCheck.isValid) {
            newErrors.email = emailCheck.error || 'Valid email is required';
            hasError = true;
        }

        const passwordCheck = validatePassword(formData.password);
        if (!passwordCheck.isValid) {
            newErrors.password = passwordCheck.error || 'Password is required';
            hasError = true;
        }

        const confirmCheck = validateConfirmPassword(formData.password, formData.confirmPassword);
        if (!confirmCheck.isValid) {
            newErrors.confirmPassword = confirmCheck.error || 'Passwords must match';
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        const result = await execute({
            data: {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: selectedRole,
            } as RegisterRequest,
        });

        if (result) {
            sessionStorage.setItem('verificationEmail', formData.email);
            navigate('/verify-email', {
                state: { email: formData.email }
            });
        }
    };

    return {
        selectedRole,
        handleRolePick,
        formData,
        errors,
        showPassword,
        showConfirmPassword,
        loading,
        apiLoading: loading,
        serverError,
        validationError,
        handleInputChange,
        handleSubmit,
        togglePasswordVisibility,
        toggleConfirmPasswordVisibility,
    };
}
