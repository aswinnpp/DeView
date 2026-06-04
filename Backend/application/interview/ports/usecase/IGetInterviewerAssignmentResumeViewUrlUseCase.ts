export interface IGetInterviewerAssignmentResumeViewUrlInputDTO {
  interviewId: string;
  interviewerUserId: string;
}

export interface IGetInterviewerAssignmentResumeViewUrlUseCase {
  execute(input: IGetInterviewerAssignmentResumeViewUrlInputDTO): Promise<{ url: string }>;
}

