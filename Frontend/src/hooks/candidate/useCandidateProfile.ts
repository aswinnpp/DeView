import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { candidateService } from '../../services/candidate.service';
import { authService } from '../../services/auth.service';
import type { RootState, AppDispatch } from '../../context/store';
import { logout } from '../../context/authSlice';
import {
  candidateProfileSchema,
  type CandidateProfileData,
} from '@shared/contracts/candidateProfile/profile';
import { extractApiError } from '../../api/axios';

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_RESUME_TYPE = 'application/pdf';

function getDefaultValues(email: string): CandidateProfileData {
  return {
    fullName: '',
    email,
    phone: '',
    location: '',
    dateOfBirth: '',
    title: '',
    currentCompany: '',
    currentSalary: '',
    experience: '',
    bio: '',
    expectedSalary: '',
    noticePeriod: 'Immediate',
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
  };
}

export function useCandidateProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const userEmail = user?.email ?? '';

  const [profileExists, setProfileExists] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const form = useForm<CandidateProfileData>({
    resolver: zodResolver(candidateProfileSchema),
    defaultValues: getDefaultValues(userEmail),
    mode: 'onSubmit',
  });

  const clearError = useCallback(() => setLocalError(null), []);

  // ─── Load profile on mount ────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setLocalError(null);
    try {
      const { data: result } = await candidateService.getProfile();
      if (result?.profile) {
        const loaded = { ...getDefaultValues(userEmail), ...result.profile, email: userEmail };
        form.reset(loaded);
        setProfileExists(true);
      } else {
        form.reset(getDefaultValues(userEmail));
        setProfileExists(false);
        setIsEditing(true);
      }
    } catch (err) {
      setLocalError(extractApiError(err));
      form.reset(getDefaultValues(userEmail));
      setProfileExists(false);
      setIsEditing(true);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail, form]);

  useEffect(() => {
    if (!userEmail) return;
    fetchProfile();
  }, [userEmail, fetchProfile]);

  // ─── Array helpers (skills / languages) ───────────────────────
  const handleArrayChange = useCallback(
    (field: 'skills' | 'languages', index: number, value: string) => {
      const current = form.getValues(field);
      const updated = [...current];
      updated[index] = value;
      form.setValue(field, updated, { shouldDirty: true });
    },
    [form]
  );

  const addArrayItem = useCallback(
    (field: 'skills' | 'languages') => {
      const current = form.getValues(field);
      form.setValue(field, [...current, ''], { shouldDirty: true });
    },
    [form]
  );

  const removeArrayItem = useCallback(
    (field: 'skills' | 'languages', index: number) => {
      const current = form.getValues(field);
      form.setValue(
        field,
        current.filter((_: string, i: number) => i !== index),
        { shouldDirty: true }
      );
    },
    [form]
  );

  // ─── Clean data before sending ────────────────────────────────
  const cleanProfileData = (data: CandidateProfileData): Partial<CandidateProfileData> => {
    const cleaned: Partial<CandidateProfileData> = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'skills' || key === 'languages') {
        const filtered = (value as string[]).filter((item: string) => item.trim() !== '');
        if (filtered.length > 0) {
          (cleaned as Record<string, unknown>)[key] = filtered;
        }
      } else if (typeof value === 'string' && value.trim() !== '') {
        (cleaned as Record<string, unknown>)[key] = value.trim();
      } else if (typeof value === 'boolean') {
        (cleaned as Record<string, unknown>)[key] = value;
      }
    }
    return cleaned;
  };

  // ─── Submit (save) ────────────────────────────────────────────
  const onSubmit = async (values: CandidateProfileData) => {
    setLocalError(null);
    setIsSaving(true);
    try {
      const cleanedData = cleanProfileData(values);
      if (profileExists) {
        await candidateService.updateProfile(cleanedData);
      } else {
        await candidateService.createProfile(cleanedData);
      }
      setProfileExists(true);
      setIsEditing(false);
    } catch (err) {
      setLocalError(extractApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    // If no changes were made, just exit edit mode without validation
    if (!form.formState.isDirty) {
      setLocalError(null);
      setIsEditing(false);
      return;
    }
    form.handleSubmit(onSubmit, (validationErrors) => {
      const firstError = Object.values(validationErrors)[0];
      setLocalError(firstError?.message ?? 'Please fix the errors above.');
    })();
  };

  const handleCancel = useCallback(() => {
    form.reset();
    setLocalError(null);
    setIsEditing(false);
  }, [form]);

  // ─── Resume upload ────────────────────────────────────────────
  const handleResumeUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
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
          form.setValue('resumeUrl', resumeUrl, { shouldDirty: true });
        }
      } catch (err) {
        setLocalError(extractApiError(err));
      } finally {
        setIsUploading(false);
      }
    },
    [form]
  );

  // ─── Logout ───────────────────────────────────────────────────
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
    form,
    profileData: form.watch(),
    isEditing,
    setIsEditing,
    isLoading,
    isSaving,
    isUploading,
    isLoggingOut,
    error: localError,
    clearError,
    validationErrors: form.formState.errors,
    profileExists,
    handleArrayChange,
    addArrayItem,
    removeArrayItem,
    handleSave,
    handleCancel,
    handleResumeUpload,
    handleLogout,
  };
}
