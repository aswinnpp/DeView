import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, type Resolver, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  hrProfileService,
  type ProfileData,
  type GetProfileResponse,
} from "../../services/hrProfile.service";
import { APP_ROUTES } from "../../constants/routes";
import { useLogout } from "../auth/useLogout";
import { hrProfileSchema, type HrProfileFormValues } from "../../../../Shared/contracts/hr/hrProfile.schema";

export type { ProfileData } from "../../services/hrProfile.service";

export type HrProfileFeedback = {
  variant: "success" | "error";
  message: string;
};

const defaultValues: HrProfileFormValues = {
  fullName: "",
  phone: "",
  location: "",
  title: "",
  bio: "",
  technicalSkills: [],
  languages: ["English"],
  currentCompany: "",
  yearsOfExperience: 0,
  education: undefined,
  university: undefined,
  educationList: [
    {
      degree: "",
      university: "",
      year: "",
    },
  ],
  workExperience: [
    {
      company: "",
      jobTitle: "",
      years: 0,
      description: "",
    },
  ],
  linkedinUrl: "",
  githubUrl: "",
  profilePicUrl: "",
};

function toFormValues(data: ProfileData): HrProfileFormValues {
  const educationList =
    data.educationList?.length
      ? data.educationList
      : data.education
        ? [
            {
              degree: data.education,
              university: data.university ?? "",
              year: "",
            },
          ]
        : [
            {
              degree: "",
              university: "",
              year: "",
            },
          ];

  const workExperience =
    data.workExperience?.length
      ? data.workExperience
      : data.currentCompany
        ? [
            {
              company: data.currentCompany,
              jobTitle: "",
              years: data.yearsOfExperience ?? 0,
              description: "",
            },
          ]
        : [
            {
              company: "",
              jobTitle: "",
              years: 0,
              description: "",
            },
          ];

  return {
    ...data,
    technicalSkills: data.technicalSkills || [],
    languages: data.languages?.length ? data.languages : ["English"],
    linkedinUrl: data.linkedinUrl ?? "",
    githubUrl: data.githubUrl ?? "",
    profilePicUrl: data.profilePicUrl ?? "",
    educationList,
    workExperience,
    education: data.education && data.education.trim() ? data.education : undefined,
    university: data.university && data.university.trim() ? data.university : undefined,
  };
}

function toProfileData(values: HrProfileFormValues): ProfileData {
  const derivedEducation = values.educationList?.[0];
  const derivedWork = values.workExperience?.[0];
  const yearsOfExperience =
    values.workExperience?.reduce((sum, w) => sum + (Number.isFinite(w.years) ? w.years : 0), 0) ?? 0;

  return {
    fullName: values.fullName,
    phone: values.phone ?? "",
    location: values.location ?? "",
    title: values.title,
    bio: values.bio,
    technicalSkills: values.technicalSkills,
    languages: values.languages,
    currentCompany: derivedWork?.company && derivedWork.company.trim() ? derivedWork.company : undefined,
    yearsOfExperience,
    education:
      derivedEducation?.degree && derivedEducation.degree.trim() ? derivedEducation.degree : undefined,
    university:
      derivedEducation?.university && derivedEducation.university.trim()
        ? derivedEducation.university
        : undefined,
    educationList: values.educationList ?? [],
    workExperience: values.workExperience ?? [],
    linkedinUrl: values.linkedinUrl ?? "",
    githubUrl: values.githubUrl ?? "",
    profilePicUrl: values.profilePicUrl ?? "",
  };
}

export function useHrProfile() {
  const navigate = useNavigate();
  const { logout: handleLogout } = useLogout();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<GetProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<HrProfileFeedback | null>(null);
  const navigateAfterDismissRef = useRef<string | null>(null);

  const dismissProfileFeedback = useCallback(() => {
    const path = navigateAfterDismissRef.current;
    navigateAfterDismissRef.current = null;
    setProfileFeedback(null);
    if (path) navigate(path);
  }, [navigate]);

  const form = useForm<HrProfileFormValues>({
    resolver: zodResolver(hrProfileSchema) as unknown as Resolver<HrProfileFormValues>,
    defaultValues,
    mode: "onSubmit",
  });

  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const data = await hrProfileService.getProfile();
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

  const onSubmit: SubmitHandler<HrProfileFormValues> = useCallback(
    async (values) => {
      try {
        const payload = toProfileData(values);
        if (profileData?.hasProfile) {
          setIsUpdating(true);
          await hrProfileService.updateProfile(payload);
          setProfileFeedback({
            variant: "success",
            message: "Profile updated successfully!",
          });
          setIsEditing(false);
          await fetchProfile();
        } else {
          setIsCreating(true);
          await hrProfileService.createProfile(payload);
          navigateAfterDismissRef.current = APP_ROUTES.HR_DASHBOARD;
          setProfileFeedback({
            variant: "success",
            message: "Profile created successfully!",
          });
        }
      } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string } } };
        setProfileFeedback({
          variant: "error",
          message: err?.response?.data?.error || "Failed to save profile",
        });
      } finally {
        setIsCreating(false);
        setIsUpdating(false);
      }
    },
    [profileData?.hasProfile, fetchProfile]
  );

  const getInitials = useCallback((name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const getProfilePicViewUrl = useCallback(() => hrProfileService.getProfilePicViewUrl(), []);

  return {
    form,
    profileData,
    profileLoading,
    formValues: form.watch(),
    isEditing,
    setIsEditing,
    isCreating,
    isUpdating,
    fetchProfile,
    handleLogout,
    handleArrayInput,
    onSubmit,
    getInitials,
    profileFeedback,
    dismissProfileFeedback,
    getProfilePicViewUrl,
  };
}
