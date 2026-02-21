import type { CreateTeamMemberDTO } from "../../../application/company/ports/usecase/CreateTeamMemberUseCasePort.js";
import type { AuthenticatedUser } from "../middleware/authMiddleware.js";

/** Body shape from request (fullName, email) */
interface CreateTeamMemberBody {
  fullName: string;
  email: string;
}

/**
 * Maps HTTP request data to Company Team UseCase DTOs.
 * Combines validated body + authenticated user (userId, companyId) + role.
 */
export const CompanyTeamMapper = {
  /** POST /company/hr/create — create HR member */
  toCreateHRDTO(body: CreateTeamMemberBody, user: AuthenticatedUser): CreateTeamMemberDTO {
    return {
      fullName: body.fullName,
      email: body.email,
      role: "hr",
      userId: user.userId,
      companyIdFromToken: user.companyId,
    };
  },

  /** POST /company/interviewer/create — create interviewer */
  toCreateInterviewerDTO(body: CreateTeamMemberBody, user: AuthenticatedUser): CreateTeamMemberDTO {
    return {
      fullName: body.fullName,
      email: body.email,
      role: "interviewer",
      userId: user.userId,
      companyIdFromToken: user.companyId,
    };
  },
};
