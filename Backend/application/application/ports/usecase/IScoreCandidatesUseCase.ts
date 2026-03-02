export interface IScoreCandidateInput {
  applicationId: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  experience?: string;
  education?: string;
  skills?: string;
  coverLetter?: string;
  bio?: string;
  title?: string;
  currentCompany?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  preferredWorkMode?: string;
  preferredJobType?: string;
  university?: string;
  graduationYear?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface IScoreCandidatesInput {
  jobId: string;
  companyId: string;
  candidates: IScoreCandidateInput[];
}

export interface IScoreResult {
  applicationId: string;
  matchScore: number;
}

export interface IScoreCandidatesResult {
  scores: IScoreResult[];
}

export interface IScoreCandidatesUseCase {
  execute(input: IScoreCandidatesInput): Promise<IScoreCandidatesResult>;
}
