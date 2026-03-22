/** Interview room details — input + output in one module. */

export interface IGetInterviewRoomDetailsInputDTO {
  interviewId: string;
  userId: string;
  role: string;
  companyId?: string;
}

export interface IGetInterviewRoomDetailsOutputDTO {
  interviewId: string;
  roomName: string;
  scheduledDate: string;
  scheduledTime: string;
  jobTitle: string;
  companyName: string;
  candidateName: string;
  interviewerName: string;
}
