import type { HrProfile } from "../../../domain/entities/HrProfile";
import type {
  ICreateHrProfileInputDTO,
  IUpdateHrProfileInputDTO,
} from "../dtos/HrProfileDTO.js";
import { AppError } from "../../../shared/errors/AppError.js";

export interface HrProfileView {
  fullName: string;
  phone: string;
  location: string;
  title: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  bio: string;
  technicalSkills: string[];
  languages: string[];
  education?: string;
  university?: string;
  educationList: Array<{
    degree: string;
    university: string;
    year?: string;
  }>;
  workExperience: Array<{
    company: string;
    jobTitle?: string;
    years: number;
    description?: string;
  }>;
  linkedinUrl: string;
  githubUrl: string;
  profilePicUrl: string;
}

export function toView(profile: HrProfile): HrProfileView {
  const educationList =
    profile.educationList?.length && profile.educationList.length > 0
      ? profile.educationList
      : profile.education
        ? [
            {
              degree: profile.education,
              university: profile.university ?? "",
            },
          ]
        : [];

  const workExperience =
    profile.workExperience?.length && profile.workExperience.length > 0
      ? profile.workExperience
      : profile.currentCompany
        ? [
            {
              company: profile.currentCompany,
              jobTitle: undefined,
              years: profile.yearsOfExperience ?? 0,
            },
          ]
        : [];

  const yearsOfExperience = workExperience.reduce((sum, w) => sum + (w.years ?? 0), 0);
  const currentCompany = workExperience[0]?.company ?? profile.currentCompany;
  const education = educationList[0]?.degree ?? profile.education;
  const university = educationList[0]?.university ?? profile.university;

  return {
    fullName: profile.fullName,
    phone: profile.phone,
    location: profile.location,
    title: profile.title,
    currentCompany,
    yearsOfExperience,
    bio: profile.bio,
    technicalSkills: profile.technicalSkills,
    languages: profile.languages,
    education,
    university,
    educationList,
    workExperience,
    linkedinUrl: profile.linkedinUrl,
    githubUrl: profile.githubUrl,
    profilePicUrl: profile.profilePicUrl,
  };
}

export function toProfileStateView(profile: HrProfile | null): {
  hasProfile: boolean;
  data?: HrProfileView;
} {
  return {
    hasProfile: profile !== null,
    data: profile ? toView(profile) : undefined,
  };
}

export function toCreateDTO(body: HrProfileView, userId: string): ICreateHrProfileInputDTO {
  const educationList = body.educationList ?? [];
  const workExperience = body.workExperience ?? [];

  const yearsOfExperience =
    body.yearsOfExperience ??
    workExperience.reduce((sum, w) => sum + (w.years ?? 0), 0);

  const currentCompany =
    body.currentCompany ??
    workExperience[0]?.company ??
    "";

  const education = body.education ?? educationList[0]?.degree ?? "";
  const university = body.university ?? educationList[0]?.university ?? "";

  return {
    userId,
    fullName: body.fullName,
    phone: body.phone ?? "",
    location: body.location ?? "",
    title: body.title,
    currentCompany,
    yearsOfExperience,
    bio: body.bio,
    technicalSkills: body.technicalSkills ?? [],
    languages: body.languages ?? [],
    education,
    university,
    educationList,
    workExperience,
    linkedinUrl: body.linkedinUrl ?? "",
    githubUrl: body.githubUrl ?? "",
    profilePicUrl: body.profilePicUrl ?? "",
  };
}

export function toUpdateDTO(body: Partial<HrProfileView>, userId: string): IUpdateHrProfileInputDTO {
  return {
    userId,
    ...body,
  };
}

export function toProfilePicStorageKey(profile: HrProfile | null): string {
  const raw = profile?.profilePicUrl ?? "";
  const key = raw.trim();
  if (!key) {
    throw AppError.notFound("Profile picture not found");
  }
  return key;
}
