export type ApplicationStatus =
  | 'PENDING'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_COMPLETE'
  | 'COMPLETED'
  | 'HIRED'
  | 'REJECTED'
  | 'RESCHEDULE_REQUESTED';

export type InterviewDetails = {
  round: string;
  interviewer: string;
  interviewerEmail?: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  interviewType?: 'ONLINE' | 'CALL' | 'F2F';
  interviewLocation?: string;
  interviewerAccepted?: boolean;
  interviewerRejectReason?: string;
  /** Filled when interviewer submits feedback */
  feedback?: string;
  totalScore?: number;
};

/** One round in interviewRounds - same shape, used in array */
export type InterviewRoundDetails = InterviewDetails;

export type RescheduleRequest = {
  originalDate: string;
  originalTime: string;
  requestedDate: string;
  requestedTime: string;
  reason: string;
  requestedAt: Date;
};

export class Application {
  constructor(
    public id: string | null,
    public jobId: string,
    public companyId: string,
    public candidateUserId: string,
    public fullName: string,
    public email: string,
    public phone?: string,
    public location?: string,
    public title?: string,
    public currentCompany?: string,
    public experience?: string,
    public bio?: string,
    public expectedSalary?: string,
    public noticePeriod?: string,
    public preferredWorkMode?: string,
    public preferredJobType?: string,
    public skills: string[] = [],
    public education?: string,
    public university?: string,
    public graduationYear?: string,
    public linkedinUrl?: string,
    public githubUrl?: string,
    public resumeUrl: string = '',
    public coverLetter?: string,
    public status: ApplicationStatus = 'PENDING',
    public aiScore?: number,
    /** @deprecated Use interviewRounds. Kept for backward compat. */
    public interviewDetails?: InterviewDetails,
    /** All rounds attempted for this application (schedule + feedback per round) */
    public interviewRounds: InterviewRoundDetails[] = [],
    public rescheduleRequest?: RescheduleRequest,
    public completedRounds: string[] = [],
    public rejectionEmailContent?: string,
    public rejectionSentAt?: Date,
    public offerEmailContent?: string,
    public offerSentAt?: Date,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}
