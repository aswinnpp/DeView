export type ApplicationStatus = 'PENDING' | 'SHORTLISTED' | 'REJECTED';

export class Application {
  constructor(
    public id: string | null,
    public jobId: string,
    public companyId: string,
    public candidateUserId: string,
    public fullName: string,
    public email: string,
    public phone?: string,
    public location?: string,
    public title?: string,
    public currentCompany?: string,
    public experience?: string,
    public bio?: string,
    public expectedSalary?: string,
    public noticePeriod?: string,
    public preferredWorkMode?: string,
    public preferredJobType?: string,
    public skills: string[] = [],
    public education?: string,
    public university?: string,
    public graduationYear?: string,
    public linkedinUrl?: string,
    public githubUrl?: string,
    public resumeUrl: string = '',
    public coverLetter?: string,
    public status: ApplicationStatus = 'PENDING',
    public aiScore?: number,
    public rejectionEmailContent?: string,
    public rejectionSentAt?: Date,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}
