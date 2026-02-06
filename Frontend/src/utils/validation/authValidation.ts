// Auth Field Validators - Basic validation functions

export interface ValidationResult {
    isValid: boolean;
    error: string | null;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
    if (!email || email.trim() === '') {
        return { isValid: false, error: 'Email is required' };
    }
    if (!email.includes('@') || !email.includes('.')) {
        return { isValid: false, error: 'Please enter a valid email' };
    }
    return { isValid: true, error: null };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
    if (!password || password.trim() === '') {
        return { isValid: false, error: 'Password is required' };
    }
    if (password.length < 6) {
        return { isValid: false, error: 'Password must be at least 6 characters' };
    }
    return { isValid: true, error: null };
};

// Confirm password validation
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
    if (!confirmPassword || confirmPassword.trim() === '') {
        return { isValid: false, error: 'Please confirm your password' };
    }
    if (password !== confirmPassword) {
        return { isValid: false, error: 'Passwords do not match' };
    }
    return { isValid: true, error: null };
};

// Name validation
export const validateName = (name: string, fieldName: string = 'Name'): ValidationResult => {
    if (!name || name.trim() === '') {
        return { isValid: false, error: `${fieldName} is required` };
    }
    if (name.trim().length < 2) {
        return { isValid: false, error: `${fieldName} must be at least 2 characters` };
    }
    return { isValid: true, error: null };
};

// OTP validation
export const validateOtp = (otp: string): ValidationResult => {
    if (!otp || otp.trim() === '') {
        return { isValid: false, error: 'OTP is required' };
    }
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
        return { isValid: false, error: 'OTP must be 6 digits' };
    }
    return { isValid: true, error: null };
};

// Role validation
export const validateRole = (role: string | null): ValidationResult => {
    if (!role) {
        return { isValid: false, error: 'Please select a role' };
    }
    return { isValid: true, error: null };
};
