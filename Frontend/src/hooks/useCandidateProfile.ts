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
  type ProfileData,
} from '../utils/validation/profileSchema';
import { getErrorMessage } from '../utils/validation/apiValidation';

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_RESUME_TYPE = 'application/pdf';

type ProfileResponse = { profile: ProfileData };

export function useCandidateProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const userEmail = user?.email ?? '';

  const [profileData, setProfileData] = useState<ProfileData>(() => getInitialProfileData(userEmail));
  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { loading: isLoading, execute: fetchProfile, reset: resetFetch, error: fetchError } = useApi<ProfileResponse>('/candidate/profile', 'GET');

  const displayError = localError ?? fetchError;
  const clearError = useCallback(() => setLocalError(null), []);

  // Load profile on mount
  useEffect(() => {
    if (!userEmail) return;

    const loadProfile = async () => {
      const result = await fetchProfile();
      if (result?.profile) {
        const loaded = { ...getInitialProfileData(userEmail), ...result.profile, email: userEmail };
        setProfileData(loaded);
        setOriginalProfile(loaded);
        setProfileExists(true);
      } else {
        setProfileData(getInitialProfileData(userEmail));
        setProfileExists(false);
        setIsEditing(true);
      }
    };

    loadProfile();
  }, [userEmail, fetchProfile]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setProfileData(prev => ({ ...prev, [name]: checked }));
      } else {
        setProfileData(prev => ({ ...prev, [name]: value }));
      }
      if (validationErrors[name]) {
        setValidationErrors(prev => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    },
    [validationErrors]
  );

  const handleArrayChange = useCallback((field: 'skills' | 'languages', index: number, value: string) => {
    setProfileData(prev => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  }, []);

  const addArrayItem = useCallback((field: 'skills' | 'languages') => {
    setProfileData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  }, []);

  const removeArrayItem = useCallback((field: 'skills' | 'languages', index: number) => {
    setProfileData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  }, []);

  const saveProfile = useCallback(async (): Promise<boolean> => {
    setLocalError(null);
    setValidationErrors({});

    const validation = validateProfile(profileData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setLocalError(validation.firstError ?? 'Validation failed');
      return false;
    }

    setIsSaving(true);
    try {
      const cleanedData = cleanProfileData(profileData);
      const method = profileExists ? 'PATCH' : 'POST';
      const response = await api.request({
        url: '/candidate/profile',
        method,
        data: cleanedData,
      });

      if (response.data) {
        setOriginalProfile({ ...profileData });
        setProfileExists(true);
        return true;
      }
      return false;
    } catch (err) {
      setLocalError(getErrorMessage(err));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [profileData, profileExists]);

  const handleSave = useCallback(async () => {
    const success = await saveProfile();
    if (success) setIsEditing(false);
  }, [saveProfile]);

  const handleCancel = useCallback(() => {
    if (originalProfile) setProfileData({ ...originalProfile });
    setLocalError(null);
    setValidationErrors({});
    setIsEditing(false);
  }, [originalProfile]);

  const handleResumeUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== ACCEPTED_RESUME_TYPE) {
      setLocalError('Please upload a PDF file');
      return;
    }
    if (file.size > MAX_RESUME_SIZE_BYTES) {
      setLocalError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setLocalError(null);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await api.post('/candidate/profile/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const resumeUrl = response.data?.resumeUrl;
      if (resumeUrl) {
        setProfileData(prev => ({ ...prev, resumeUrl }));
      }
    } catch (err) {
      setLocalError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    resetFetch();
    const result = await fetchProfile();
    if (result?.profile) {
      const loaded = { ...getInitialProfileData(userEmail), ...result.profile, email: userEmail };
      setProfileData(loaded);
      setOriginalProfile(loaded);
      setProfileExists(true);
    }
  }, [fetchProfile, resetFetch, userEmail]);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } catch {
      // Still logout locally even if API fails
    } finally {
      dispatch(logout());
      setIsLoggingOut(false);
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
