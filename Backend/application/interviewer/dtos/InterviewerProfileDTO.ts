/** Interviewer profile create/update — input + output in one module. */

export interface IEducationEntry {
  degree: string;
  university: string;
  year?: string;
}

export interface IWorkExperienceEntry {
  company: string;
  jobTitle?: string;
  years: number;
  description?: string;
}

export interface ICreateInterviewerProfileInputDTO {
  userId: string;
  fullName: string;
  phone: string;
  location: string;
  title: string;
  // Legacy summary fields (optional; derived from arrays).
  currentCompany?: string;
  yearsOfExperience?: number;
  bio: string;
  technicalSkills: string[];
  languages: string[];
  // Legacy single education fields (optional; derived from educationList).
  education?: string;
  university?: string;

  // Multi-value fields (new).
  educationList: IEducationEntry[];
  workExperience: IWorkExperienceEntry[];

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
  educationList?: IEducationEntry[];
  workExperience?: IWorkExperienceEntry[];
  linkedinUrl?: string;
  githubUrl?: string;
  profilePicUrl?: string;
}

export interface IUpdateInterviewerProfileOutputDTO {
  message: string;
}
