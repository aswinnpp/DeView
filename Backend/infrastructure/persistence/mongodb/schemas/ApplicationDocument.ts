import { ObjectId } from 'mongodb';

export interface IApplicationDocument {
  _id?: ObjectId;
  jobId: string;
  companyId: string;
  candidateUserId: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  title?: string;
  currentCompany?: string;
  experience?: string;
  bio?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  preferredWorkMode?: string;
  preferredJobType?: string;
  skills: string[];
  education?: string;
  university?: string;
  graduationYear?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  resumeUrl: string;
  coverLetter?: string;
  status:
    | 'PENDING'
    | 'SHORTLISTED'
    | 'INTERVIEW_SCHEDULED'
    | 'INTERVIEW_COMPLETE'
    | 'COMPLETED'
    | 'HIRED'
    | 'REJECTED'
    | 'RESCHEDULE_REQUESTED';
  aiScore?: number;
  /** @deprecated Use interviewRounds. Kept for backward compat. */
  interviewDetails?: {
    round: string;
    interviewer: string;
    interviewerEmail?: string;
    scheduledDate: string;
    scheduledTime: string;
    feedback?: string;
    totalScore?: number;
  };
  /** All rounds attempted (schedule + feedback per round) */
  interviewRounds?: Array<{
    round: string;
    interviewer: string;
    interviewerEmail?: string;
    scheduledDate: string;
    scheduledTime: string;
    feedback?: string;
    totalScore?: number;
  }>;
  /** Candidate requested to reschedule an interview. */
  rescheduleRequest?: {
    originalDate: string;
    originalTime: string;
    requestedDate: string;
    requestedTime: string;
    reason: string;
    requestedAt: Date;
  };
  /** Rounds the candidate has already attempted/completed */
  completedRounds?: string[];
  /** Optional rejection email content saved when application is rejected */
  rejectionEmailContent?: string;
  /** When the rejection email was sent */
  rejectionSentAt?: Date;
  /** Full offer letter body saved when status becomes HIRED */
  offerEmailContent?: string;
  /** When the offer letter was saved */
  offerSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
