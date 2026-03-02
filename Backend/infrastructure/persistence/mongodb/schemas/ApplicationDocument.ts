import { ObjectId } from 'mongodb';

export interface IApplicationDocument {
  _id?: ObjectId;
  jobId: string;
  companyId: string;
  candidateUserId: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  title?: string;
  currentCompany?: string;
  experience?: string;
  bio?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  preferredWorkMode?: string;
  preferredJobType?: string;
  skills: string[];
  education?: string;
  university?: string;
  graduationYear?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  resumeUrl: string;
  coverLetter?: string;
  status: 'PENDING' | 'SHORTLISTED' | 'REJECTED';
  aiScore?: number;
  /** Optional rejection email content saved when application is rejected */
  rejectionEmailContent?: string;
  /** When the rejection email was sent */
  rejectionSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
