import { api } from "../api/axios";
import { API_ROUTES } from "../constants/routes";

export interface InterviewRoomDetails {
  interviewId: string;
  roomName: string;
  scheduledDate: string;
  scheduledTime: string;
  jobTitle: string;
  companyName: string;
  candidateName: string;
  interviewerName: string;
}

export const interviewsService = {
  getRoomDetails: (interviewId: string) =>
    api
      .get<{ data?: InterviewRoomDetails }>(API_ROUTES.INTERVIEWS.ROOM(interviewId))
      .then((res) => res.data?.data as InterviewRoomDetails),

  updateStatus: (interviewId: string, status: 'COMPLETED' | 'CANCELLED') =>
    api.patch(API_ROUTES.INTERVIEWS.UPDATE_STATUS(interviewId), { status }),
};

