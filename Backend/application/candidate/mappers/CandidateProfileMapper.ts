import type {
  ICreateCandidateProfileInputDTO,
  IUpdateCandidateProfileInputDTO,
} from '../dtos/CandidateProfileDTO.js';
import type { CallerContext } from '../../shared/types/CallerContext.js';

export interface ICreateProfileBody {
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
  profilePicUrl?: string;
}

export type IUpdateProfileBody = Partial<ICreateProfileBody>;

export const CandidateProfileMapper = {
  toCreateDTO(body: ICreateProfileBody, context: CallerContext): ICreateCandidateProfileInputDTO {
    return {
      ...body,
      userId: context.userId,
    };
  },

  toUpdateDTO(body: IUpdateProfileBody, context: CallerContext): IUpdateCandidateProfileInputDTO {
    return {
      userId: context.userId,
      ...body,
    };
  },
};
