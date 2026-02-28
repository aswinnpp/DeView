import { ObjectId } from 'mongodb';

export interface IJobDocument {
  _id?: ObjectId;
  companyId: string;
  title: string;
  department: string;
  location: string;
  jobType: string;
  workMode: string;
  experienceLevel: string;
  minExperience?: string;
  maxExperience?: string;
  salary?: string;
  salaryNonDisclosure: boolean;
  skills: string;
  qualifications: string;
  responsibilities: string;
  benefits?: string;
  description: string;
  applicationDeadline?: string;
  numberOfPositions: number;
  interviewRounds: string[];
  status: 'OPEN' | 'CLOSED';
  applicants: string[];
  createdAt: Date;
  updatedAt: Date;
}

