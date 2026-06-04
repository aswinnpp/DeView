export type InterviewStatus = 'SCHEDULED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';
export type InterviewType = 'ONLINE' | 'CALL' | 'F2F';

export type CandidateRejection = { date: string; reason: string };
export type CandidateRejectionStatus = 'PENDING' | 'DECLINED';

export class Interview {
  constructor(
    public id: string | null,
    public companyId: string,
    public companyName: string,
    public jobId: string,
    public jobTitle: string,
    public roomName: string,
    public applicationId: string,
    public candidateUserId: string,
    public candidateName: string,
    public interviewerUserId: string,
    public interviewerName: string,
    public round: string,
    public scheduledDate: string, 
    public scheduledTime: string, 
    public interviewType: InterviewType = 'ONLINE',
    public interviewLocation?: string,
    public status: InterviewStatus = 'SCHEDULED',
    public feedbackSubmitted: boolean = false,
    public interviewerAccepted: boolean = false,
    public interviewerRejectReason?: string,
    public candidateRejection?: CandidateRejection,
    public candidateRejectionStatus?: CandidateRejectionStatus,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}

