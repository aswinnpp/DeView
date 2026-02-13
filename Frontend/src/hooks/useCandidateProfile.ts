import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { candidateService } from '../services/candidate.service';
import { authService } from '../services/auth.service';
import type { RootState, AppDispatch } from '../context/store';
import { logout } from '../context/authSlice';
import {
  validateProfile,
  cleanProfileData,
  getInitialProfileData,
  type ProfileData,
} from '../utils/validation/profileSchema';
import { extractApiError } from '../api/axios';

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_RESUME_TYPE = 'application/pdf';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError;
  const clearError = useCallback(() => setLocalError(null), []);

  // Load profile on mount
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setLocalError(null);
    try {
      const { data: result } = await candidateService.getProfile();
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
    } catch (err) {
      setLocalError(extractApiError(err));
      setProfileData(getInitialProfileData(userEmail));
      setProfileExists(false);
      setIsEditing(true);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) return;
    fetchProfile();
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
      if (profileExists) {
        await candidateService.updateProfile(cleanedData);
      } else {
        await candidateService.createProfile(cleanedData);
      }

      setOriginalProfile({ ...profileData });
      setProfileExists(true);
      return true;
    } catch (err) {
      setLocalError(extractApiError(err));
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
      const { data } = await candidateService.uploadResume(file);
      const resumeUrl = data?.resumeUrl;
      if (resumeUrl) {
        setProfileData(prev => ({ ...prev, resumeUrl }));
      }
    } catch (err) {
      setLocalError(extractApiError(err));
    } finally {
      setIsUploading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
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
