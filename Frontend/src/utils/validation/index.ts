// Validation utilities barrel export

// Auth validation
export {
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    validateName,
    validateOtp,
    validateRole,
    type ValidationResult,
} from './authValidation';

// Profile validation
export {
    validateFullName,
    validatePhone,
    validateBio,
    validateExpectedSalary,
    validateNoticePeriod,
    validateSkills,
    validateUrl,
    validateLinkedinUrl,
    validateGithubUrl,
    validateLocation,
    validateDateOfBirth,
    validateProfile,
    cleanProfileData,
    getInitialProfileData,
    type ProfileData,
    type ProfileValidationResult,
} from './profileValidation';

// API validation
export {
    getErrorMessage,
    isAuthError,
    isPermissionError,
    isNetworkError,
} from './apiValidation';
