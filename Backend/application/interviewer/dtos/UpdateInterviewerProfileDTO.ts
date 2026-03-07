export interface UpdateInterviewerProfileDTO {
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
}
