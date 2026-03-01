export type JobApplicantStatus = 'PENDING' | 'SHORTLISTED' | 'REJECTED';

export interface IJobApplicantDetail {
  applicationId: string;
  candidateUserId: string;
  fullName: string;
  email: string;
  status: JobApplicantStatus;
  appliedAt: Date;
}
