import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "../../services/auth.service";
import {
  interviewerProfileService,
  type ProfileData,
  type GetProfileResponse,
} from "../../services/interviewerProfile.service";
import { logout } from "../../context/authSlice";
import type { AppDispatch } from "../../context/store";
import { APP_ROUTES } from "../../constants/routes";
import {
  interviewerProfileSchema,
  type InterviewerProfileFormValues,
} from "../../../../Shared/contracts/interviewer/interviewerProfile.schema";

export type { ProfileData } from "../../services/interviewerProfile.service";

const defaultValues: InterviewerProfileFormValues = {
  fullName: "",
  phone: "",
  location: "",
  title: "",
  currentCompany: "",
  yearsOfExperience: 0,
  bio: "",
  technicalSkills: [],
  languages: ["English"],
  education: "",
  university: "",
  linkedinUrl: "",
  githubUrl: "",
};

function toFormValues(data: ProfileData): InterviewerProfileFormValues {
  return {
    ...data,
    technicalSkills: data.technicalSkills || [],
    languages: data.languages?.length ? data.languages : ["English"],
    linkedinUrl: data.linkedinUrl ?? "",
    githubUrl: data.githubUrl ?? "",
  };
}

function toProfileData(values: InterviewerProfileFormValues): ProfileData {
  return {
    fullName: values.fullName,
    phone: values.phone ?? "",
    location: values.location ?? "",
    title: values.title,
    currentCompany: values.currentCompany ?? "",
    yearsOfExperience: values.yearsOfExperience,
    bio: values.bio,
    technicalSkills: values.technicalSkills,
    languages: values.languages,
    education: values.education,
    university: values.university ?? "",
    linkedinUrl: values.linkedinUrl ?? "",
    githubUrl: values.githubUrl ?? "",
  };
}

export function useInterviewerProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<GetProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<InterviewerProfileFormValues>({
    resolver: zodResolver(interviewerProfileSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const data = await interviewerProfileService.getProfile();
      setProfileData(data);
      if (data?.hasProfile && data.data) {
        form.reset(toFormValues(data.data));
        setIsEditing(false);
      } else {
        form.reset(defaultValues);
        setIsEditing(true);
      }
    } catch {
      setProfileData({ hasProfile: false });
      form.reset(defaultValues);
      setIsEditing(true);
    } finally {
      setProfileLoading(false);
    }
  }, [form]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      dispatch(logout());
      navigate(APP_ROUTES.LOGIN, { replace: true });
    }
  }, [dispatch, navigate]);

  const handleArrayInput = useCallback(
    (field: "technicalSkills" | "languages", value: string, action: "add" | "remove", index?: number) => {
      const current = form.getValues(field);
      if (action === "add" && value.trim()) {
        form.setValue(field, [...current, value.trim()], { shouldDirty: true });
      } else if (action === "remove" && index !== undefined) {
        form.setValue(
          field,
          current.filter((_, i) => i !== index),
          { shouldDirty: true }
        );
      }
    },
    [form]
  );

  const onSubmit: SubmitHandler<InterviewerProfileFormValues> = useCallback(
    async (values) => {
      try {
        const payload = toProfileData(values);
        if (profileData?.hasProfile) {
          setIsUpdating(true);
          await interviewerProfileService.updateProfile(payload);
          alert("Profile updated successfully!");
          setIsEditing(false);
          await fetchProfile();
        } else {
          setIsCreating(true);
          await interviewerProfileService.createProfile(payload);
          alert("Profile created successfully!");
          navigate(APP_ROUTES.INTERVIEWER_DASHBOARD);
        }
      } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string } } };
        alert(err?.response?.data?.error || "Failed to save profile");
      } finally {
        setIsCreating(false);
        setIsUpdating(false);
      }
    },
    [profileData?.hasProfile, fetchProfile, navigate]
  );

  const getInitials = useCallback((name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const formValues = form.watch();

  return {
    form,
    profileData,
    profileLoading,
    formValues,
    isEditing,
    setIsEditing,
    isCreating,
    isUpdating,
    fetchProfile,
    handleLogout,
    handleArrayInput,
    onSubmit,
    getInitials,
  };
}
