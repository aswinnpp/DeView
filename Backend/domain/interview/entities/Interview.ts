export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export class Interview {
  constructor(
    public id: string | null,
    public companyId: string,
    public companyName: string,
    public jobId: string,
    public jobTitle: string,
    public applicationId: string,
    public candidateUserId: string,
    public candidateName: string,
    public interviewerUserId: string,
    public interviewerName: string,
    public round: string,
    public scheduledDate: string, // YYYY-MM-DD
    public scheduledTime: string, // HH:mm
    public status: InterviewStatus = 'SCHEDULED',
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}

