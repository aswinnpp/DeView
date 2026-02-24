import type { ICreateTeamMemberDTO } from "../../../application/company/ports/usecase/ICreateTeamMemberUseCase.js";
import type { IAuthenticatedUser } from "../middleware/authMiddleware.js";

interface ICreateTeamMemberBody {
  fullName: string;
  email: string;
}


export const CompanyTeamMapper = {
  toCreateHRDTO(body: ICreateTeamMemberBody, user: IAuthenticatedUser): ICreateTeamMemberDTO {
    return {
      fullName: body.fullName,
      email: body.email,
      role: "hr",
      userId: user.userId,
      companyIdFromToken: user.companyId,
    };
  },

  toCreateInterviewerDTO(body: ICreateTeamMemberBody, user: IAuthenticatedUser): ICreateTeamMemberDTO {
    return {
      fullName: body.fullName,
      email: body.email,
      role: "interviewer",
      userId: user.userId,
      companyIdFromToken: user.companyId,
    };
  },
};
