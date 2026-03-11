export interface IUpdateInterviewStatusUseCase {
  execute(input: {
    interviewId: string;
    interviewerUserId: string;
    status: 'COMPLETED' | 'CANCELLED';
  }): Promise<void>;
}

