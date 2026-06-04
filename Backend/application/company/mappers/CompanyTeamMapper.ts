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

  toListMembersInput(
    query: { search?: string; status?: string; page?: string; limit?: string },
    context: CallerContext,
    role: 'hr' | 'interviewer'
  ): {
    userId: string;
    companyIdFromToken?: string;
    role: 'hr' | 'interviewer';
    search?: string;
    status?: string;
    page?: string;
    limit?: string;
  } {
    return {
      userId: context.userId,
      companyIdFromToken: context.companyId,
      role,
      search: query.search,
      status: query.status,
      page: query.page,
      limit: query.limit,
    };
  },

  toToggleMemberStatusInput(
    params: { id: string },
    context: CallerContext
  ): {
    memberId: string;
    userId: string;
    companyIdFromToken?: string;
  } {
    return {
      memberId: params.id,
      userId: context.userId,
      companyIdFromToken: context.companyId,
    };
  },

  toGetInterviewerSlotsInput(
    params: { id: string },
    query: { slotDate?: string },
    context: CallerContext
  ): {
    interviewerId: string;
    companyId: string;
    slotDate?: string;
  } {
    return {
      interviewerId: params.id,
      companyId: context.companyId || '',
      slotDate: query.slotDate,
    };
  },
};
