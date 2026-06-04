export interface IApplyForJobInput {
  jobId: string;
  candidateUserId: string;
  useResumeFromProfile: boolean;
  coverLetter?: string;
  resumeUrl?: string;
}

export interface IApplyForJobUseCase {
  execute(input: IApplyForJobInput): Promise<{ applicationId: string }>;
}
