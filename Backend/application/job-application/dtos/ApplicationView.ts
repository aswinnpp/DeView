
export interface ApplicationView {
  id: string | null;
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
  educationList?: Array<{ degree: string; institution: string; year: string }>;
  workExperience?: Array<{ jobTitle: string; company: string; startDate: string; endDate?: string; description?: string }>;
  linkedinUrl?: string;
  githubUrl?: string;
  resumeUrl: string;
  coverLetter?: string;
  status: string;
  aiScore?: number;
  /** @deprecated Use interviewRounds. Last/single round for backward compat. */
  interviewDetails?: {
    round: string;
    interviewer: string;
    interviewerEmail?: string;
    scheduledDate: string;
    scheduledTime: string;
    interviewType?: 'ONLINE' | 'CALL' | 'F2F';
    interviewLocation?: string;
    interviewerAccepted?: boolean;
    interviewerRejectReason?: string;
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
    interviewType?: 'ONLINE' | 'CALL' | 'F2F';
    interviewLocation?: string;
    interviewerAccepted?: boolean;
    interviewerRejectReason?: string;
    feedback?: string;
    totalScore?: number;
  }>;
  rescheduleRequest?: {
    originalDate: string;
    originalTime: string;
    requestedDate: string;
    requestedTime: string;
    reason: string;
    requestedAt: string;
  };
  completedRounds?: string[];
  rejectionEmailContent?: string;
  rejectionSentAt?: string;
  offerEmailContent?: string;
  offerSentAt?: string;
  createdAt: string;
  updatedAt: string;
}
