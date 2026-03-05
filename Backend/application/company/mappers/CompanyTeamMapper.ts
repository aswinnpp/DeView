import type { ICreateTeamMemberDTO } from '../ports/usecase/ICreateTeamMemberUseCase.js';
import type { CallerContext } from '../../shared/types/CallerContext.js';

export interface ICreateTeamMemberBody {
  fullName: string;
  email: string;
}

export const CompanyTeamMapper = {
  toCreateHRDTO(body: ICreateTeamMemberBody, context: CallerContext): ICreateTeamMemberDTO {
    return {
      fullName: body.fullName,
      email: body.email,
      role: 'hr',
      userId: context.userId,
      companyIdFromToken: context.companyId,
    };
  },

  toCreateInterviewerDTO(body: ICreateTeamMemberBody, context: CallerContext): ICreateTeamMemberDTO {
    return {
      fullName: body.fullName,
      email: body.email,
      role: 'interviewer',
      userId: context.userId,
      companyIdFromToken: context.companyId,
    };
  },
};
