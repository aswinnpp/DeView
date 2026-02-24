export interface ICandidate {
  id: string;
  active: boolean;
  status?: string;
  [key: string]: any;
}

export interface IInterview {
  id: string;
  hrName?: string;
  interviewerName?: string;
  candidateName: string;
  candidateId: string;
  scheduledAt: string;
  jd?: string;
  jobId?: string;
  [key: string]: any;
}

