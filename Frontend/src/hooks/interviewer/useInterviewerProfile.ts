import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  interviewerProfileService,
  type ProfileData,
  type GetProfileResponse,
} from "../../services/interviewerProfile.service";
import { APP_ROUTES } from "../../constants/routes";
import { useLogout } from "../auth/useLogout";
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
  bio: "",
  technicalSkills: [],
  languages: ["English"],
  // Legacy fields (derived from the multi-value lists).
  currentCompany: "",
  yearsOfExperience: 0,
  education: undefined,
  university: undefined,

  // Multi-value fields.
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

function toFormValues(data: ProfileData): InterviewerProfileFormValues {
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

    // Avoid sending empty strings for optional legacy fields.
    education: data.education && data.education.trim() ? data.education : undefined,
    university: data.university && data.university.trim() ? data.university : undefined,
  };
}

function toProfileData(values: InterviewerProfileFormValues): ProfileData {
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

    // Legacy summary fields (derived from arrays).
    currentCompany: derivedWork?.company && derivedWork.company.trim() ? derivedWork.company : undefined,
    yearsOfExperience,
    education:
      derivedEducation?.degree && derivedEducation.degree.trim() ? derivedEducation.degree : undefined,
    university:
      derivedEducation?.university && derivedEducation.university.trim()
        ? derivedEducation.university
        : undefined,

    // Multi-value fields.
    educationList: values.educationList ?? [],
    workExperience: values.workExperience ?? [],

    linkedinUrl: values.linkedinUrl ?? "",
    githubUrl: values.githubUrl ?? "",
    profilePicUrl: values.profilePicUrl ?? "",
  };
}

export function useInterviewerProfile() {
  const navigate = useNavigate();
  const { logout: handleLogout } = useLogout();
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
