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
import { useFileUpload } from '../useFileUpload';

const MAX_RESUME_SIZE_BYTES = 100 * 1024 * 1024; // 100MB (matches backend)
const ACCEPTED_RESUME_TYPES = ['application/pdf', 'application/x-pdf'];
const ACCEPTED_RESUME_EXT = '.pdf';

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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const resumeUploader = useFileUpload();

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
      const msg = extractApiError(err) || 'Failed to load profile.';
      console.error('Fetch profile failed:', err);
      setLocalError(msg);
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



  // ─── Submit (save) ────────────────────────────────────────────
  const onSubmit = async (values: CandidateProfileData) => {
    setLocalError(null);
    setIsSaving(true);
    try {
      if (profileExists) {
        await candidateService.updateProfile(values);
        await fetchProfile();
      } else {
        await candidateService.createProfile(values);
        await fetchProfile();
      }
      setProfileExists(true);

      setIsEditing(false);
    } catch (err) {
      const msg = extractApiError(err) || 'Request failed. Please try again.';
      console.error('Profile save failed:', err);
      setLocalError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormSubmit = (e?: React.BaseSyntheticEvent) => {
    form.handleSubmit(
      (values) => {
        if (!form.formState.isDirty) {
          setIsEditing(false);
          return;
        }
        onSubmit(values);
      },
      (validationErrors) => {
        const firstError = Object.values(validationErrors)[0];
        setLocalError(firstError?.message ?? 'Please fix the errors above.');
      }
    )(e);
  };

  const handleCancel = useCallback(() => {
    form.reset();
    setLocalError(null);
    setIsEditing(false);
  }, [form]);

  /** Validate specific fields (for step-by-step). Returns true if valid. */
  const validateStep = useCallback(
    async (fields: (keyof CandidateProfileData)[]) => {
      const valid = await form.trigger(fields);
      if (!valid) {
        const firstError = Object.values(form.formState.errors)[0];
        setLocalError(firstError?.message ?? 'Please fix the errors above.');
      } else {
        setLocalError(null);
      }
      return valid;
    },
    [form]
  );

  // ─── Resume: upload immediately to Cloudinary ──────────────────
  const handleResumeUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const isPdf =
        ACCEPTED_RESUME_TYPES.includes(file.type) ||
        file.name.toLowerCase().endsWith(ACCEPTED_RESUME_EXT);
      if (!isPdf) {
        setLocalError('Please upload a PDF file');
        return;
      }
      if (file.size > MAX_RESUME_SIZE_BYTES) {
        setLocalError(`File size must be under ${MAX_RESUME_SIZE_BYTES / (1024 * 1024)}MB`);
        return;
      }
      setLocalError(null);
      resumeUploader.clearError();
      event.target.value = '';
      try {
        const url = await resumeUploader.uploadFile('resume', file);
        form.setValue('resumeUrl', url, { shouldDirty: true, shouldValidate: true });
      } catch (err) {
        const msg = extractApiError(err) || 'Resume upload failed. Please try again.';
        setLocalError(msg);
      }
      event.target.value = '';
    },
    [form, resumeUploader]
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
    isUploading: resumeUploader.uploading,
    isLoggingOut,
    error: localError,
    clearError,
    validationErrors: form.formState.errors,
    profileExists,
    handleArrayChange,
    addArrayItem,
    removeArrayItem,
    handleFormSubmit,
    handleCancel,
    validateStep,
    handleResumeUpload,
    handleLogout,
  };
}
