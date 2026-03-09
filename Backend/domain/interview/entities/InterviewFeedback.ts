export class InterviewFeedback {
  constructor(
    public id: string | null,
    public interviewId: string,
    public candidateUserId: string,
    public companyId: string,
    public companyName: string,
    public interviewerUserId: string,
    public interviewerName: string,
    public feedback: string,
    public totalScore: number,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}

