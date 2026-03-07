import { api } from "../api/axios";
import { API_ROUTES } from "../constants/routes";

export interface ProfileData {
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
}

export interface GetProfileResponse {
  hasProfile: boolean;
  data?: ProfileData;
}

export const interviewerProfileService = {
  getProfile: () =>
    api
      .get<GetProfileResponse>(API_ROUTES.INTERVIEWER.PROFILE)
      .then((res) => res.data),

  createProfile: (data: ProfileData) =>
    api.post(API_ROUTES.INTERVIEWER.PROFILE, data),

  updateProfile: (data: ProfileData) =>
    api.patch(API_ROUTES.INTERVIEWER.PROFILE, data),
};
