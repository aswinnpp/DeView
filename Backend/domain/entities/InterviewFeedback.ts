export class InterviewFeedback {
  constructor(
    public id: string | null,
    public interviewId: string,
    public candidateUserId: string,
    public companyId: string,
    public companyName: string,
    public jobId: string,
    public interviewerUserId: string,
    public interviewerName: string,
    public round: string,
    public feedback: string,
    public totalScore: number,
    public interviewType?: 'ONLINE' | 'CALL' | 'F2F',
    public interviewLocation?: string,
 
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}

