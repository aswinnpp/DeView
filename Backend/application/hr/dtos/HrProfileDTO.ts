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

export interface ICreateHrProfileInputDTO {
  userId: string;
  fullName: string;
  phone: string;
  location: string;
  title: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  bio: string;
  technicalSkills: string[];
  languages: string[];
  education?: string;
  university?: string;
  educationList: IEducationEntry[];
  workExperience: IWorkExperienceEntry[];
  linkedinUrl: string;
  githubUrl: string;
  profilePicUrl: string;
}

export interface ICreateHrProfileOutputDTO {
  message: string;
}

export interface IUpdateHrProfileInputDTO {
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

export interface IUpdateHrProfileOutputDTO {
  message: string;
}
