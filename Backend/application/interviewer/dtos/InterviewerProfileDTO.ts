/** Interviewer profile create/update — input + output in one module. */

export interface ICreateInterviewerProfileInputDTO {
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
  linkedinUrl: string;
  githubUrl: string;
  profilePicUrl: string;
}

export interface ICreateInterviewerProfileOutputDTO {
  message: string;
}

export interface IUpdateInterviewerProfileInputDTO {
  userId: string;
  fullName?: string;
  phone?: string;
  location?: string;
  title?: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  bio?: string;
  technicalSkills?: string[];
  languages?: string[];
  education?: string;
  university?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  profilePicUrl?: string;
}

export interface IUpdateInterviewerProfileOutputDTO {
  message: string;
}
