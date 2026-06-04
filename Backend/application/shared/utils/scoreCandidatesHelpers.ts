

export interface IScoreCandidateInput {
  applicationId: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  experience?: string;
  education?: string;
  skills?: string;
  coverLetter?: string;
  bio?: string;
  title?: string;
  currentCompany?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  preferredWorkMode?: string;
  preferredJobType?: string;
  university?: string;
  graduationYear?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export function buildCandidateProfileText(c: IScoreCandidateInput): string {
  const parts: string[] = [
    `Name: ${c.name}`,
    c.email ? `Email: ${c.email}` : '',
    c.phone ? `Phone: ${c.phone}` : '',
    c.location ? `Location: ${c.location}` : '',
    c.title ? `Title: ${c.title}` : '',
    c.currentCompany ? `Current Company: ${c.currentCompany}` : '',
    c.experience ? `Experience: ${c.experience}` : '',
    c.education ? `Education: ${c.education}` : '',
    c.university ? `University: ${c.university}` : '',
    c.graduationYear ? `Graduation Year: ${c.graduationYear}` : '',
    c.skills ? `Skills: ${c.skills}` : '',
    c.bio ? `Bio: ${c.bio}` : '',
    c.coverLetter ? `Cover Letter: ${c.coverLetter}` : '',
    c.expectedSalary ? `Expected Salary: ${c.expectedSalary}` : '',
    c.noticePeriod ? `Notice Period: ${c.noticePeriod}` : '',
    c.preferredWorkMode ? `Preferred Work Mode: ${c.preferredWorkMode}` : '',
    c.preferredJobType ? `Preferred Job Type: ${c.preferredJobType}` : '',
    c.linkedinUrl ? `LinkedIn: ${c.linkedinUrl}` : '',
    c.githubUrl ? `GitHub: ${c.githubUrl}` : '',
  ];
  return parts.filter(Boolean).join('\n');
}

export function buildJobDescriptionText(job: {
  title: string;
  description: string;
  qualifications: string;
  skills: string;
  responsibilities: string;
  experienceLevel?: string;
  department?: string;
}): string {
  const parts: string[] = [
    `Title: ${job.title}`,
    job.department ? `Department: ${job.department}` : '',
    job.experienceLevel ? `Experience Level: ${job.experienceLevel}` : '',
    job.description ? `Description: ${job.description}` : '',
    job.qualifications ? `Qualifications: ${job.qualifications}` : '',
    job.skills ? `Required Skills: ${job.skills}` : '',
    job.responsibilities ? `Responsibilities: ${job.responsibilities}` : '',
  ];
  return parts.filter(Boolean).join('\n');
}

