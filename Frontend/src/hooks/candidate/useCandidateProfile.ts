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

  const form = useForm<CandidateProfileData>({
    resolver: zodResolver(candidateProfileSchema),
    defaultValues: getDefaultValues(userEmail),
    mode: 'onSubmit',
  });

  const clearError = useCallback(() => setLocalError(null), []);

  // ─── Load profile on mount ────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    console.log('[useCandidateProfile] fetchProfile called, userEmail:', userEmail);
    setIsLoading(true);
    setLocalError(null);
    try {
      const response = await candidateService.getProfile();
      const result = response?.data;
      console.log('[useCandidateProfile] getProfile response:', response);
      console.log('[useCandidateProfile] getProfile result:', result);
      console.log('[useCandidateProfile] result?.profile:', result?.profile);
      if (result?.profile) {
        const loaded = { ...getDefaultValues(userEmail), ...result.profile, email: userEmail };
        form.reset(loaded);
        setProfileExists(true);
        console.log('[useCandidateProfile] profile loaded, reset form');
      } else {
        form.reset(getDefaultValues(userEmail));
        setProfileExists(false);
        setIsEditing(true);
        console.log('[useCandidateProfile] no profile yet, set editing true');
      }
    } catch (err) {
      const msg = extractApiError(err) || 'Failed to load profile.';
      console.error('[useCandidateProfile] Fetch profile failed:', err);
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
    console.log('[useCandidateProfile] onSubmit called', { profileExists, valuesKeys: Object.keys(values) });
    setLocalError(null);
    setIsSaving(true);
    try {
      if (profileExists) {
        console.log('[useCandidateProfile] calling updateProfile...');
        const updateRes = await candidateService.updateProfile(values);
        console.log('[useCandidateProfile] updateProfile response:', updateRes);
        await fetchProfile();
      } else {
        console.log('[useCandidateProfile] calling createProfile...');
        const createRes = await candidateService.createProfile(values);
        console.log('[useCandidateProfile] createProfile response:', createRes);
        await fetchProfile();
      }
      setProfileExists(true);
      setIsEditing(false);
      console.log('[useCandidateProfile] save success');
    } catch (err) {
      const msg = extractApiError(err) || 'Request failed. Please try again.';
      console.error('[useCandidateProfile] Profile save failed:', err);
      console.error('[useCandidateProfile] save error response:', (err as any)?.response);
      setLocalError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormSubmit = (e?: React.BaseSyntheticEvent) => {
    console.log('[useCandidateProfile] handleFormSubmit called', { profileExists, isDirty: form.formState.isDirty, errors: form.formState.errors });
    form.handleSubmit(
      (values) => {
        const isDirty = form.formState.isDirty;
        if (profileExists && !isDirty) {
          console.log('[useCandidateProfile] profile exists and form not dirty, skipping save');
          setIsEditing(false);
          return;
        }
        console.log('[useCandidateProfile] form valid, calling onSubmit');
        onSubmit(values);
      },
      (validationErrors) => {
        console.error('[useCandidateProfile] validation failed:', validationErrors);
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
    handleLogout,
  };
}
