import { api } from "../api/axios";
import { API_ROUTES } from "../constants/routes";

export interface ProfileData {
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

export interface GetProfileResponse {
  hasProfile: boolean;
  data?: ProfileData;
}

export const hrProfileService = {
  getProfile: () =>
    api.get<GetProfileResponse>(API_ROUTES.HR.PROFILE).then((res) => res.data),

  createProfile: (data: ProfileData) => api.post(API_ROUTES.HR.PROFILE, data),

  updateProfile: (data: ProfileData) => api.patch(API_ROUTES.HR.PROFILE, data),

  updateProfilePartial: (data: Partial<ProfileData>) =>
    api.patch(API_ROUTES.HR.PROFILE, data),

  getProfilePicViewUrl: () =>
    api
      .get<{ url: string }>(`${API_ROUTES.HR.PROFILE}/profile-pic-view-url`)
      .then((res) => res.data),
};
