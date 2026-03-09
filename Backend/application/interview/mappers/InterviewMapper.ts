import { parseSearchParams } from '../../shared/utils/parseSearchParams.js';
import type { IListInterviewerAssignmentsInput } from '../use-cases/list-interviewer-assignments.usecase.js';
import type { IListCompletedInterviewsForInterviewerInput } from '../use-cases/list-completed-interviews-for-interviewer.usecase.js';
import type { IListMyInterviewsInput } from '../use-cases/list-my-interviews.usecase.js';
import type { IListMyInterviewFeedbacksInput } from '../use-cases/list-my-interview-feedbacks.usecase.js';

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
  ): IListInterviewerAssignmentsInput {
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
  ): IListCompletedInterviewsForInterviewerInput {
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

  toListMyInterviewsInput(query: IListMyInterviewsQuery, candidateUserId: string): IListMyInterviewsInput {
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
  ): IListMyInterviewFeedbacksInput {
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
};
