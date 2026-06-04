import { AppError } from '../../../shared/errors/AppError.js';
import type { InterviewerSlotsUpsertBody } from '../../../../Shared/contracts/interviewer/interviewerSlots.schema.js';

export const InterviewerSlotsMapper = {
  toInterviewerContext(user: { userId: string; companyId?: string }) {
    const companyId = user.companyId ?? '';
    if (!companyId) throw AppError.forbidden('No company associated with this account');
    return { interviewerId: user.userId, companyId };
  },

  toGetMySlotsInput(
    interviewerId: string,
    companyId: string,
    query: { slotDate?: string }
  ) {
    return {
      interviewerId,
      companyId,
      slotDate: query.slotDate,
    };
  },

  toUpsertInput(
    interviewerId: string,
    body: InterviewerSlotsUpsertBody,
    companyIdFromUser: string | undefined
  ) {
    const companyId = companyIdFromUser ?? body.companyId;
    if (!companyId) throw AppError.badRequest('companyId is required');
    const booked = body.booked ?? false;
    return {
      interviewerId,
      companyId,
      slotDate: body.slotDate,
      times: body.times,
      booked,
    };
  },
};
