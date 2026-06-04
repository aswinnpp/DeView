export interface IApplicationInput {
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
}

export interface IJobApplicationRepository {
  create(input: IApplicationInput): Promise<string>;
}
