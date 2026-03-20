import type { InterviewerProfile } from "../../../domain/entities/InterviewerProfile";
import type { CreateInterviewerProfileDTO } from "../dtos/CreateInterviewerProfileDTO";
import type { UpdateInterviewerProfileDTO } from "../dtos/UpdateInterviewerProfileDTO";

export interface InterviewerProfileView {
  fullName: string;
  phone: string;
  location: string;
  title: string;
  currentCompany: string;
  yearsOfExperience: number;
  bio: string;
  technicalSkills: string[];
  languages: string[];
  education: string;
  university: string;
  linkedinUrl: string;
  githubUrl: string;
  profilePicUrl: string;
}

export function toView(profile: InterviewerProfile): InterviewerProfileView {
  return {
    fullName: profile.fullName,
    phone: profile.phone,
    location: profile.location,
    title: profile.title,
    currentCompany: profile.currentCompany,
    yearsOfExperience: profile.yearsOfExperience,
    bio: profile.bio,
    technicalSkills: profile.technicalSkills,
    languages: profile.languages,
    education: profile.education,
    university: profile.university,
    linkedinUrl: profile.linkedinUrl,
    githubUrl: profile.githubUrl,
    profilePicUrl: profile.profilePicUrl,
  };
}

export function toCreateDTO(
  body: InterviewerProfileView,
  userId: string
): CreateInterviewerProfileDTO {
  return {
    userId,
    fullName: body.fullName,
    phone: body.phone ?? "",
    location: body.location ?? "",
    title: body.title,
    currentCompany: body.currentCompany ?? "",
    yearsOfExperience: body.yearsOfExperience,
    bio: body.bio,
    technicalSkills: body.technicalSkills ?? [],
    languages: body.languages ?? [],
    education: body.education,
    university: body.university ?? "",
    linkedinUrl: body.linkedinUrl ?? "",
    githubUrl: body.githubUrl ?? "",
    profilePicUrl: body.profilePicUrl ?? "",
  };
}

export function toUpdateDTO(
  body: Partial<InterviewerProfileView>,
  userId: string
): UpdateInterviewerProfileDTO {
  return {
    userId,
    ...body,
  };
}
