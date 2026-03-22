/** AI score candidates — input + output in one module. */

export interface IScoreCandidateInputDTO {
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

export interface IScoreCandidatesInputDTO {
  jobId: string;
  companyId: string;
  candidates: IScoreCandidateInputDTO[];
}

export interface IScoreResultDTO {
  applicationId: string;
  matchScore: number;
}

export interface IScoreCandidatesOutputDTO {
  scores: IScoreResultDTO[];
}
