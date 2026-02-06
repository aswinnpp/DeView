import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useApi, api } from './useApi';
import type { RootState, AppDispatch } from '../context/store';
import { logout } from '../context/authSlice';
import {
    validateProfile,
    cleanProfileData,
    getInitialProfileData,
    type ProfileData
} from '../utils/validation/profileValidation';

interface ProfileResponse {
    profile: ProfileData;
}

interface UseCandidateProfileReturn {
    // Profile data
    profileData: ProfileData;

    // Edit mode
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;

    // Loading states
    isLoading: boolean;
    isSaving: boolean;
    isUploading: boolean;
    isLoggingOut: boolean;

    // Error handling
    error: string | null;
    clearError: () => void;
    validationErrors: { [key: string]: string };

    // Profile status
    profileExists: boolean;

    // Form handlers
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleArrayChange: (field: 'skills' | 'languages', index: number, value: string) => void;
    addArrayItem: (field: 'skills' | 'languages') => void;
    removeArrayItem: (field: 'skills' | 'languages', index: number) => void;

    // Actions
    handleSave: () => Promise<void>;
    handleCancel: () => void;
    handleResumeUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleLogout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}


export function useCandidateProfile(): UseCandidateProfileReturn {
    // Redux dispatch and navigation
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Get user email from Redux store
    const user = useSelector((state: RootState) => state.auth.user);
    const userEmail = user?.email || '';

    // Profile state
    const [profileData, setProfileData] = useState<ProfileData>(getInitialProfileData(userEmail));
    const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(null);
    const [profileExists, setProfileExists] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);

    // Loading states
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // API hooks
    const {
        loading: isLoading,
        error,
        execute: fetchProfile,
        reset: resetFetch
    } = useApi<ProfileResponse>('/candidate/profile', 'GET');

    const [localError, setLocalError] = useState<string | null>(null);

    // Combined error from API or local validation
    const displayError = error || localError;

    // Clear error
    const clearError = useCallback(() => {
        setLocalError(null);
    }, []);

    // Fetch profile on mount
    useEffect(() => {
        const loadProfile = async () => {
            const result = await fetchProfile();

            if (result?.profile) {
                // Profile exists - populate form
                const loadedProfile = {
                    ...getInitialProfileData(userEmail),
                    ...result.profile,
                    email: userEmail, // Always use current user email
                };
                setProfileData(loadedProfile);
                setOriginalProfile(loadedProfile);
                setProfileExists(true);
            } else {
                // No profile yet - use initial data with user email
                const initialData = getInitialProfileData(userEmail);
                setProfileData(initialData);
                setProfileExists(false);
                // Auto-enable editing for new profiles
                setIsEditing(true);
            }
        };

        if (userEmail) {
            loadProfile();
        }
    }, [userEmail, fetchProfile]);

    // Form input change handler
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setProfileData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setProfileData(prev => ({ ...prev, [name]: value }));
        }
        // Clear field-specific error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [validationErrors]);

    // Array field handlers (skills, languages)
    const handleArrayChange = useCallback((field: 'skills' | 'languages', index: number, value: string) => {
        setProfileData(prev => {
            const newArray = [...prev[field]];
            newArray[index] = value;
            return { ...prev, [field]: newArray };
        });
    }, []);

    const addArrayItem = useCallback((field: 'skills' | 'languages') => {
        setProfileData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    }, []);

    const removeArrayItem = useCallback((field: 'skills' | 'languages', index: number) => {
        setProfileData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    }, []);

    // Save profile (create or update)
    const saveProfile = useCallback(async (): Promise<boolean> => {
        // Clear previous errors
        setLocalError(null);
        setValidationErrors({});

        // Validate profile before sending
        const validation = validateProfile(profileData);

        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            setLocalError(validation.firstError);
            return false;
        }

        setIsSaving(true);

        try {
            // Clean the data before sending
            const cleanedData = cleanProfileData(profileData);

            // Choose endpoint based on whether profile exists
            const endpoint = '/candidate/profile';
            const method = profileExists ? 'PATCH' : 'POST';

            const response = await api.request({
                url: endpoint,
                method: method,
                data: cleanedData,
            });

            if (response.data) {
                // Update original profile reference
                setOriginalProfile({ ...profileData });
                setProfileExists(true);
                return true;
            }

            return false;
        } catch (err: unknown) {
            // Handle API errors
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { error?: string; message?: string } } };
                const errorMessage = axiosError.response?.data?.error ||
                    axiosError.response?.data?.message ||
                    'Failed to save profile';
                setLocalError(errorMessage);
            } else {
                setLocalError('Failed to save profile. Please try again.');
            }
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [profileData, profileExists]);

    // Handle save with edit mode toggle
    const handleSave = useCallback(async () => {
        const success = await saveProfile();
        if (success) {
            setIsEditing(false);
        }
    }, [saveProfile]);

    // Handle cancel - reset to original and exit edit mode
    const handleCancel = useCallback(() => {
        if (originalProfile) {
            setProfileData({ ...originalProfile });
        }
        setLocalError(null);
        setValidationErrors({});
        setIsEditing(false);
    }, [originalProfile]);

    // Upload resume handler
    const handleResumeUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (file.type !== 'application/pdf') {
            setLocalError('Please upload a PDF file');
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setLocalError('File size must be less than 5MB');
            return;
        }

        setIsUploading(true);
        setLocalError(null);

        try {
            const formData = new FormData();
            formData.append('resume', file);

            const response = await api.post('/candidate/profile/resume', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data?.resumeUrl) {
                setProfileData(prev => ({
                    ...prev,
                    resumeUrl: response.data.resumeUrl,
                }));
            }
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { error?: string; message?: string } } };
                const errorMessage = axiosError.response?.data?.error ||
                    axiosError.response?.data?.message ||
                    'Failed to upload resume';
                setLocalError(errorMessage);
            } else {
                setLocalError('Failed to upload resume. Please try again.');
            }
        } finally {
            setIsUploading(false);
        }
    }, []);

    // Refresh profile from server
    const refreshProfile = useCallback(async () => {
        resetFetch();
        const result = await fetchProfile();

        if (result?.profile) {
            const loadedProfile = {
                ...getInitialProfileData(userEmail),
                ...result.profile,
                email: userEmail,
            };
            setProfileData(loadedProfile);
            setOriginalProfile(loadedProfile);
            setProfileExists(true);
        }
    }, [fetchProfile, resetFetch, userEmail]);

    // Handle logout - clear Redux state, call backend to clear cookies
    const handleLogout = useCallback(async () => {
        setIsLoggingOut(true);
        try {
            // Call backend to clear HTTP-only cookies
            await api.post('/auth/logout');
        } catch {
            // Even if API call fails, still logout locally
            console.error('Logout API call failed, proceeding with local logout');
        } finally {
            // Clear Redux state and localStorage
            dispatch(logout());
            setIsLoggingOut(false);
            // Navigate to login page
            navigate('/login', { replace: true });
        }
    }, [dispatch, navigate]);

    return {
        profileData,
        isEditing,
        setIsEditing,
        isLoading,
        isSaving,
        isUploading,
        isLoggingOut,
        error: displayError,
        clearError,
        validationErrors,
        profileExists,
        handleInputChange,
        handleArrayChange,
        addArrayItem,
        removeArrayItem,
        handleSave,
        handleCancel,
        handleResumeUpload,
        handleLogout,
        refreshProfile,
    };
}
