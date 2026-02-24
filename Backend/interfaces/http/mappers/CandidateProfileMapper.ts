import type { ICreateCandidateProfileDTO } from "../../../application/candidate/dtos/CreateCandidateProfileDTO.js";
import type { IUpdateCandidateProfileDTO } from "../../../application/candidate/dtos/UpdateCandidateProfileDTO.js";
import type { IAuthenticatedUser } from "../middleware/authMiddleware.js";

/** Body shape from Zod-validated request (create) */
interface ICreateProfileBody {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  dateOfBirth: string;
  title?: string;
  currentCompany?: string;
  currentSalary?: string;
  experience?: string;
  bio: string;
  expectedSalary: string;
  noticePeriod: string;
  preferredWorkMode: string;
  preferredJobType: string;
  willingToRelocate: boolean;
  skills: string[];
  languages: string[];
  education: string;
  university: string;
  graduationYear: string;
  linkedinUrl?: string;
  githubUrl?: string;
  resumeUrl?: string;
}

type IUpdateProfileBody = Partial<ICreateProfileBody>;

export const CandidateProfileMapper = {
  toCreateDTO(body: ICreateProfileBody, user: IAuthenticatedUser): ICreateCandidateProfileDTO {
    return {
      ...body,
      userId: user.userId,
     
    };
  },

  toUpdateDTO(body: IUpdateProfileBody, user: IAuthenticatedUser): IUpdateCandidateProfileDTO {
    return {
      userId: user.userId,
      ...body,
    };
  },
};
