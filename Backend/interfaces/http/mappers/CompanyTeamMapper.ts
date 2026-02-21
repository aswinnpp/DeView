import type { CreateTeamMemberDTO } from "../../../application/company/ports/usecase/CreateTeamMemberUseCasePort.js";
import type { AuthenticatedUser } from "../middleware/authMiddleware.js";

interface CreateTeamMemberBody {
  fullName: string;
  email: string;
}


export const CompanyTeamMapper = {
  toCreateHRDTO(body: CreateTeamMemberBody, user: AuthenticatedUser): CreateTeamMemberDTO {
    return {
      fullName: body.fullName,
      email: body.email,
      role: "hr",
      userId: user.userId,
      companyIdFromToken: user.companyId,
    };
  },

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
