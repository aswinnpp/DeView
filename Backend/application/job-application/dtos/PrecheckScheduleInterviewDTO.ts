/** Pre-check before scheduling an interview — input + output in one module. */

export interface IPrecheckScheduleInterviewInputDTO {
  companyId: string;
  jobId: string;
  applicationId: string;
  scheduledDate?: string;
}

export interface IPrecheckScheduleInterviewOutputDTO {
  ok: true;
}
