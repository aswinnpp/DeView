import type { InterviewStatus } from '../../../domain/entities/Interview.js';
import { parseSearchParams } from '../../shared/utils/parseSearchParams.js';
import type { IListInterviewerAssignmentsInputDTO } from '../dtos/InterviewListDTO.js';
import type { IListCompletedInterviewsForInterviewerInputDTO } from '../dtos/InterviewListDTO.js';
import type { IListMyInterviewsInputDTO } from '../dtos/InterviewListDTO.js';
import type { IListMyInterviewFeedbacksInputDTO } from '../dtos/InterviewListDTO.js';
import type { IGetInterviewRoomDetailsInputDTO } from '../dtos/InterviewRoomDTO.js';
import type { IUpdateInterviewStatusInputDTO } from '../dtos/InterviewCommandDTO.js';

export interface IListAssignmentsQuery {
  search?: string;
  page?: string;
  limit?: string;
  sortOrder?: string;
  acceptedOnly?: string;
}

export interface IListCompletedQuery {
  search?: string;
  page?: string;
  limit?: string;
  sortOrder?: string;
}

export interface IListMyInterviewsQuery {
  search?: string;
  page?: string;
  limit?: string;
  sortOrder?: string;
}

export const InterviewMapper = {
  toListInterviewerAssignmentsInput(
    query: IListAssignmentsQuery,
    interviewerUserId: string
  ): IListInterviewerAssignmentsInputDTO {
    const { search, page, limit, sortOrder, acceptedOnly } = query;
    const { page: parsedPage, limit: parsedLimit } = parseSearchParams({ page, limit });
    return {
      interviewerUserId,
      search,
      page: parsedPage,
      limit: parsedLimit,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
      acceptedOnly: acceptedOnly === 'true',
    };
  },

  toListCompletedInterviewsInput(
    query: IListCompletedQuery,
    interviewerUserId: string
  ): IListCompletedInterviewsForInterviewerInputDTO {
    const { search, page, limit, sortOrder } = query;
    const { page: parsedPage, limit: parsedLimit } = parseSearchParams({ page, limit });
    return {
      interviewerUserId,
      search,
      page: parsedPage,
      limit: parsedLimit,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    };
  },

  toListMyInterviewsInput(query: IListMyInterviewsQuery, candidateUserId: string): IListMyInterviewsInputDTO {
    const { search, page, limit, sortOrder } = query;
    const { page: parsedPage, limit: parsedLimit } = parseSearchParams({ page, limit });
    return {
      candidateUserId,
      search,
      page: parsedPage,
      limit: parsedLimit,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    };
  },

  toListMyFeedbacksInput(
    query: IListMyInterviewsQuery,
    candidateUserId: string
  ): IListMyInterviewFeedbacksInputDTO {
    const { search, page, limit, sortOrder } = query;
    const { page: parsedPage, limit: parsedLimit } = parseSearchParams({ page, limit });
    return {
      candidateUserId,
      search,
      page: parsedPage,
      limit: parsedLimit,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    };
  },

  toAcceptAssignmentInput(params: { interviewId: string }, interviewerUserId: string) {
    return {
      interviewId: params.interviewId,
      interviewerUserId,
    };
  },

  toRejectAssignmentInput(
    params: { interviewId: string },
    body: { reason?: string },
    interviewerUserId: string
  ) {
    return {
      interviewId: params.interviewId,
      interviewerUserId,
      reason: body?.reason ?? '',
    };
  },

  toSubmitFeedbackInput(
    params: { interviewId: string },
    body: { feedback?: string; totalScore?: number },
    interviewerUserId: string
  ) {
    return {
      interviewId: params.interviewId,
      interviewerUserId,
      feedback: body?.feedback ?? '',
      totalScore: Number(body?.totalScore ?? 0),
    };
  },

  toRequestRescheduleInput(
    params: { interviewId: string },
    body: { requestedDate: string; reason: string },
    candidateUserId: string
  ) {
    return {
      interviewId: params.interviewId,
      candidateUserId,
      requestedDate: body.requestedDate,
      reason: body.reason,
    };
  },

  toGetInterviewRoomDetailsInput(
    params: { interviewId: string },
    currentUser: { userId: string; role: string; companyId?: string }
  ): IGetInterviewRoomDetailsInputDTO {
    return {
      interviewId: params.interviewId,
      userId: currentUser.userId,
      role: currentUser.role,
      companyId: currentUser.companyId,
    };
  },

  toUpdateInterviewStatusInput(
    params: { interviewId: string },
    body: { status: InterviewStatus },
    interviewerUserId: string
  ): IUpdateInterviewStatusInputDTO {
    return {
      interviewId: params.interviewId,
      interviewerUserId,
      status: body.status,
    };
  },
};
