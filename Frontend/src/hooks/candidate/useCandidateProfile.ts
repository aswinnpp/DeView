import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { candidateService } from '../../services/candidate.service';
import { authService } from '../../services/auth.service';
import type { RootState, AppDispatch } from '../../context/store';
import {APP_ROUTES}from "../../constants/routes"
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
    setIsLoading(true);
    setLocalError(null);
    try {
      const response = await candidateService.getProfile();
      const result = response?.data;
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
      const msg = extractApiError(err)

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
    const saveProfile = profileExists
      ? candidateService.updateProfile
      : candidateService.createProfile;

    await saveProfile(values);

    await fetchProfile();

    setProfileExists(true);
    setIsEditing(false);
  } catch (err) {
    setLocalError(extractApiError(err));
  } finally {
    setIsSaving(false);
  }
};


 const handleFormSubmit = (e?: React.BaseSyntheticEvent) => {
  form.handleSubmit(
    (values) => {
      const hasChanges = form.formState.isDirty;

      if (profileExists && !hasChanges) {
        setIsEditing(false);
        return;
      }

      console.log("eee",values);
      

      onSubmit(values);
       navigate(APP_ROUTES.CANDIDATE_INTERVIEWS)
      
    },
    (errors) => {
      const firstError = Object.values(errors)[0];
      const message =
        firstError?.message ?? 'Please fix the highlighted errors.';

      setLocalError(message);
    }
  )(e);
};


  const handleCancel = useCallback(() => {
    form.reset();
    setLocalError(null);
    setIsEditing(false);
  }, [form]);

  
 const validateStep = useCallback(
  async (fields: (keyof CandidateProfileData)[]) => {
    const isValid = await form.trigger(fields);

    if (isValid) {
      setLocalError(null);
      return true;
    }

    const errors = form.formState.errors;
    const firstError = Object.values(errors)[0];
    const message =
      firstError?.message ?? 'Please fix the highlighted errors.';

    setLocalError(message);

    return false;
  },
  [form]
);


  // ─── Logout ───────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch (err) {
      extractApiError(err)
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
