import { api } from "../api/axios";
import { API_ROUTES } from "../constants/routes";

export interface InterviewerSlotsDoc {
  interviewerId: string;
  companyId?: string;
  slotDate: string; // DD-MM-YYYY
  times: string[]; // ISO datetime strings
  booked: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const interviewerSlotsService = {
  getMySlots: (params?: { slotDate?: string }) =>
    api
      .get<InterviewerSlotsDoc[]>(API_ROUTES.INTERVIEWER.SLOTS, {
        params: { slotDate: params?.slotDate },
      })
      .then((res) => res.data),

  getInterviewerSlots: (interviewerId: string, params?: { slotDate?: string }) =>
    api
      .get<InterviewerSlotsDoc[]>(API_ROUTES.COMPANY.INTERVIEWER_SLOTS(interviewerId), {
        params: { slotDate: params?.slotDate },
      })
      .then((res) => res.data),

  upsertMySlots: (body: { slotDate: string; times: string[]; booked?: boolean }) =>
    api.post<InterviewerSlotsDoc>(API_ROUTES.INTERVIEWER.SLOTS, body).then((res) => res.data),
};

