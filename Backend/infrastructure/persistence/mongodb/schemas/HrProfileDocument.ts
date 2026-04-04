import { ObjectId } from "mongodb";

export interface IHrProfileDocument {
  _id?: ObjectId;
  userId: string;
  fullName: string;
  phone: string;
  location: string;
  title: string;
  currentCompany: string;
  yearsOfExperience: number;
  bio: string;
  technicalSkills: string[];
  languages: string[];
  education: string;
  university: string;
  educationList?: Array<{
    degree: string;
    university: string;
    year?: string;
  }>;
  workExperience?: Array<{
    company: string;
    jobTitle?: string;
    years: number;
    description?: string;
  }>;
  linkedinUrl: string;
  githubUrl: string;
  profilePicUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
