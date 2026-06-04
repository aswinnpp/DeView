export class RejectionMail {
  constructor(
    public id: string | null,
    public applicationId: string,
    public jobId: string,
    public companyId: string,
    public candidateUserId: string,
    public candidateName: string,
    public candidateEmail: string,
    public content: string,
    public createdAt: Date = new Date()
  ) {}
}

