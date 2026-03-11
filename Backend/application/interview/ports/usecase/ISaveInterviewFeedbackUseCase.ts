export interface ISaveInterviewFeedbackUseCase {
  execute(input: {
    interviewId: string;
    interviewerUserId: string;
    totalScore: number;
    feedback: string;
  }): Promise<{ success: boolean }>;
}

