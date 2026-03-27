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
  type EducationEntry,
  type WorkExperienceEntry,
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
    profilePicUrl: '',
    educationList: [],
    workExperience: [],
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

  // ─── Education list helpers ───────────────────────────────────
  const addEducation = useCallback(() => {
    const current = form.getValues('educationList') ?? [];
    form.setValue('educationList', [...current, { degree: '', institution: '', year: '' }], { shouldDirty: true });
  }, [form]);

  const removeEducation = useCallback((index: number) => {
    const current = form.getValues('educationList') ?? [];
    form.setValue('educationList', current.filter((_: EducationEntry, i: number) => i !== index), { shouldDirty: true });
  }, [form]);

  const updateEducation = useCallback((index: number, field: keyof EducationEntry, value: string) => {
    const current = form.getValues('educationList') ?? [];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    form.setValue('educationList', updated, { shouldDirty: true });
  }, [form]);

  // ─── Work experience helpers ──────────────────────────────────
  const addWorkExperience = useCallback(() => {
    const current = form.getValues('workExperience') ?? [];
    form.setValue('workExperience', [...current, { jobTitle: '', company: '', startDate: '', endDate: '', description: '' }], { shouldDirty: true });
  }, [form]);

  const removeWorkExperience = useCallback((index: number) => {
    const current = form.getValues('workExperience') ?? [];
    form.setValue('workExperience', current.filter((_: WorkExperienceEntry, i: number) => i !== index), { shouldDirty: true });
  }, [form]);

  const updateWorkExperience = useCallback((index: number, field: keyof WorkExperienceEntry, value: string) => {
    const current = form.getValues('workExperience') ?? [];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    form.setValue('workExperience', updated, { shouldDirty: true });
  }, [form]);


  // ─── Submit (save) ────────────────────────────────────────────
  const onSubmit = async (values: CandidateProfileData): Promise<boolean> => {
    setLocalError(null);
    setIsSaving(true);

    try {
      const isUpdate = profileExists;
      const saveProfile = isUpdate
        ? candidateService.updateProfile
        : candidateService.createProfile;

      const payload: Partial<CandidateProfileData> = values;

      await saveProfile(payload);

      await fetchProfile();

      setProfileExists(true);
      setIsEditing(false);
      return true;
    } catch (err) {
      setLocalError(extractApiError(err));
      return false;
    } finally {
      setIsSaving(false);
    }
  };


  const handleFormSubmit = (e?: React.BaseSyntheticEvent) => {
    form.handleSubmit(
      async (values) => {
        const ok = await onSubmit(values);

        if (ok) return;
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
    validationErrors: form.formState.errors,
    profileExists,
    handleArrayChange,
    addArrayItem,
    removeArrayItem,
    addEducation,
    removeEducation,
    updateEducation,
    addWorkExperience,
    removeWorkExperience,
    updateWorkExperience,
    handleFormSubmit,
    handleCancel,
    handleLogout,
  };
}
