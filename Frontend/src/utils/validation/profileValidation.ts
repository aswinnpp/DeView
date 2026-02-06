// Profile Field Validators - Basic validation functions for candidate profile

import type { ValidationResult } from './authValidation';

// Full Name validation
export const validateFullName = (fullName: string): ValidationResult => {
    if (!fullName || fullName.trim() === '') {
        return { isValid: false, error: 'Full name is required' };
    }
    if (fullName.trim().length < 2) {
        return { isValid: false, error: 'Full name must be at least 2 characters' };
    }
    if (fullName.trim().length > 100) {
        return { isValid: false, error: 'Full name must be less than 100 characters' };
    }
    return { isValid: true, error: null };
};

// Phone validation
export const validatePhone = (phone: string): ValidationResult => {
    if (!phone || phone.trim() === '') {
        return { isValid: true, error: null }; // Phone is optional
    }
    // Basic phone validation - allows various formats
    const phoneRegex = /^[\d\s\-+()]{7,20}$/;
    if (!phoneRegex.test(phone)) {
        return { isValid: false, error: 'Please enter a valid phone number' };
    }
    return { isValid: true, error: null };
};

// Bio validation
export const validateBio = (bio: string): ValidationResult => {
    if (!bio || bio.trim() === '') {
        return { isValid: false, error: 'Bio is required' };
    }
    if (bio.trim().length < 10) {
        return { isValid: false, error: 'Bio must be at least 10 characters' };
    }
    if (bio.trim().length > 1000) {
        return { isValid: false, error: 'Bio must be less than 1000 characters' };
    }
    return { isValid: true, error: null };
};

// Expected Salary validation
export const validateExpectedSalary = (salary: string): ValidationResult => {
    if (!salary || salary.trim() === '') {
        return { isValid: false, error: 'Expected salary is required' };
    }
    return { isValid: true, error: null };
};

// Notice Period validation
export const validateNoticePeriod = (noticePeriod: string): ValidationResult => {
    if (!noticePeriod || noticePeriod.trim() === '') {
        return { isValid: false, error: 'Notice period is required' };
    }
    const validPeriods = ['Immediate', '1 week', '2 weeks', '1 month', '2 months', '3 months'];
    if (!validPeriods.includes(noticePeriod)) {
        return { isValid: false, error: 'Please select a valid notice period' };
    }
    return { isValid: true, error: null };
};

// Skills validation
export const validateSkills = (skills: string[]): ValidationResult => {
    // Filter out empty skills
    const validSkills = skills.filter(skill => skill.trim() !== '');
    if (validSkills.length === 0) {
        return { isValid: true, error: null }; // Skills are optional
    }
    return { isValid: true, error: null };
};

// URL validation helper
export const validateUrl = (url: string, fieldName: string): ValidationResult => {
    if (!url || url.trim() === '') {
        return { isValid: true, error: null }; // URLs are optional
    }
    try {
        new URL(url);
        return { isValid: true, error: null };
    } catch {
        return { isValid: false, error: `Please enter a valid ${fieldName} URL` };
    }
};

// LinkedIn URL validation
export const validateLinkedinUrl = (url: string): ValidationResult => {
    if (!url || url.trim() === '') {
        return { isValid: true, error: null }; // Optional
    }
    if (!url.includes('linkedin.com')) {
        return { isValid: false, error: 'Please enter a valid LinkedIn URL' };
    }
    return validateUrl(url, 'LinkedIn');
};

// GitHub URL validation  
export const validateGithubUrl = (url: string): ValidationResult => {
    if (!url || url.trim() === '') {
        return { isValid: true, error: null }; // Optional
    }
    if (!url.includes('github.com')) {
        return { isValid: false, error: 'Please enter a valid GitHub URL' };
    }
    return validateUrl(url, 'GitHub');
};

// Location validation
export const validateLocation = (location: string): ValidationResult => {
    if (!location || location.trim() === '') {
        return { isValid: true, error: null }; // Location is optional
    }
    if (location.trim().length < 2) {
        return { isValid: false, error: 'Location must be at least 2 characters' };
    }
    return { isValid: true, error: null };
};

// Date of Birth validation
export const validateDateOfBirth = (dateOfBirth: string): ValidationResult => {
    if (!dateOfBirth || dateOfBirth.trim() === '') {
        return { isValid: true, error: null }; // Optional
    }
    const date = new Date(dateOfBirth);
    const now = new Date();

    if (isNaN(date.getTime())) {
        return { isValid: false, error: 'Please enter a valid date' };
    }

    // Must be at least 16 years old
    const minAge = 16;
    const minDate = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
    if (date > minDate) {
        return { isValid: false, error: 'You must be at least 16 years old' };
    }

    return { isValid: true, error: null };
};

// Profile Data interface
export interface ProfileData {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    dateOfBirth: string;
    title: string;
    currentCompany: string;
    currentSalary: string;
    experience: string;
    bio: string;
    expectedSalary: string;
    noticePeriod: string;
    preferredWorkMode: string;
    preferredJobType: string;
    willingToRelocate: boolean;
    skills: string[];
    languages: string[];
    education: string;
    university: string;
    graduationYear: string;
    linkedinUrl: string;
    githubUrl: string;
    resumeUrl: string;
}

// Get initial empty profile data
export const getInitialProfileData = (email: string = ''): ProfileData => ({
    fullName: '',
    email: email,
    phone: '',
    location: '',
    dateOfBirth: '',
    title: '',
    currentCompany: '',
    currentSalary: '',
    experience: '',
    bio: '',
    expectedSalary: '',
    noticePeriod: '',
    preferredWorkMode: '',
    preferredJobType: '',
    willingToRelocate: false,
    skills: [''],
    languages: [''],
    education: '',
    university: '',
    graduationYear: '',
    linkedinUrl: '',
    githubUrl: '',
    resumeUrl: '',
});

// Validate entire profile for required fields
export interface ProfileValidationResult {
    isValid: boolean;
    errors: { [key: string]: string };
    firstError: string | null;
}

export const validateProfile = (profile: ProfileData): ProfileValidationResult => {
    const errors: { [key: string]: string } = {};

    // Validate required fields
    const fullNameCheck = validateFullName(profile.fullName);
    if (!fullNameCheck.isValid) errors.fullName = fullNameCheck.error!;

    const bioCheck = validateBio(profile.bio);
    if (!bioCheck.isValid) errors.bio = bioCheck.error!;

    const expectedSalaryCheck = validateExpectedSalary(profile.expectedSalary);
    if (!expectedSalaryCheck.isValid) errors.expectedSalary = expectedSalaryCheck.error!;

    const noticePeriodCheck = validateNoticePeriod(profile.noticePeriod);
    if (!noticePeriodCheck.isValid) errors.noticePeriod = noticePeriodCheck.error!;

    // Validate optional fields (only if provided)
    const phoneCheck = validatePhone(profile.phone);
    if (!phoneCheck.isValid) errors.phone = phoneCheck.error!;

    const linkedinCheck = validateLinkedinUrl(profile.linkedinUrl);
    if (!linkedinCheck.isValid) errors.linkedinUrl = linkedinCheck.error!;

    const githubCheck = validateGithubUrl(profile.githubUrl);
    if (!githubCheck.isValid) errors.githubUrl = githubCheck.error!;

    const dobCheck = validateDateOfBirth(profile.dateOfBirth);
    if (!dobCheck.isValid) errors.dateOfBirth = dobCheck.error!;

    const isValid = Object.keys(errors).length === 0;
    const firstError = isValid ? null : Object.values(errors)[0];

    return { isValid, errors, firstError };
};

// Clean profile data before sending to backend (remove empty values)
export const cleanProfileData = (profile: ProfileData): Partial<ProfileData> => {
    const cleaned: Partial<ProfileData> = {};

    // Only include non-empty string fields
    Object.entries(profile).forEach(([key, value]) => {
        if (key === 'skills' || key === 'languages') {
            // Filter out empty array items
            const filtered = (value as string[]).filter(item => item.trim() !== '');
            if (filtered.length > 0) {
                (cleaned as Record<string, unknown>)[key] = filtered;
            }
        } else if (typeof value === 'string' && value.trim() !== '') {
            (cleaned as Record<string, unknown>)[key] = value.trim();
        } else if (typeof value === 'boolean') {
            (cleaned as Record<string, unknown>)[key] = value;
        }
    });

    return cleaned;
};
