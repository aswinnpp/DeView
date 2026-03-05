/**
 * Presentation DTO for a single application (application layer).
 */
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
  linkedinUrl?: string;
  githubUrl?: string;
  resumeUrl: string;
  coverLetter?: string;
  status: string;
  aiScore?: number;
  interviewDetails?: {
    round: string;
    interviewer: string;
    interviewerEmail?: string;
    scheduledDate: string;
    scheduledTime: string;
  };
  createdAt: string;
  updatedAt: string;
}
