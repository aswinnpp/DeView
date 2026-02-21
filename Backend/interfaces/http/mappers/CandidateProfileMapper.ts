import type { CreateCandidateProfileDTO } from "../../../application/candidate/dtos/CreateCandidateProfileDTO.js";
import type { UpdateCandidateProfileDTO } from "../../../application/candidate/dtos/UpdateCandidateProfileDTO.js";
import type { AuthenticatedUser } from "../middleware/authMiddleware.js";

/** Body shape from Zod-validated request (create) */
interface CreateProfileBody {
  fullName: string;
  email?: string;
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

/** Body shape from Zod-validated request (update - all optional) */
type UpdateProfileBody = Partial<CreateProfileBody>;

/**
 * Maps HTTP request data to Candidate Profile UseCase DTOs.
 * Combines validated body + authenticated user (userId, email).
 */
export const CandidateProfileMapper = {
  /** POST /candidate/profile — create profile */
  toCreateDTO(body: CreateProfileBody, user: AuthenticatedUser): CreateCandidateProfileDTO {
    return {
      ...body,
      userId: user.userId,
      email: body.email ?? user.email,
    };
  },

  /** PATCH /candidate/profile — update profile */
  toUpdateDTO(body: UpdateProfileBody, user: AuthenticatedUser): UpdateCandidateProfileDTO {
    return {
      userId: user.userId,
      ...body,
    };
  },
};
