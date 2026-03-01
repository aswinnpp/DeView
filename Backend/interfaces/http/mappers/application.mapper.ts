import type { Application } from '../../../domain/application/entities/Application.js';

export interface ApplicationView {
  id: string | null;
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
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const ApplicationMapper = {
  toView(app: Application): ApplicationView {
    return {
      id: app.id,
      jobId: app.jobId,
      companyId: app.companyId,
      candidateUserId: app.candidateUserId,
      fullName: app.fullName,
      email: app.email,
      phone: app.phone,
      location: app.location,
      title: app.title,
      currentCompany: app.currentCompany,
      experience: app.experience,
      bio: app.bio,
      expectedSalary: app.expectedSalary,
      noticePeriod: app.noticePeriod,
      preferredWorkMode: app.preferredWorkMode,
      preferredJobType: app.preferredJobType,
      skills: app.skills ?? [],
      education: app.education,
      university: app.university,
      graduationYear: app.graduationYear,
      linkedinUrl: app.linkedinUrl,
      githubUrl: app.githubUrl,
      resumeUrl: app.resumeUrl,
      coverLetter: app.coverLetter,
      status: app.status,
      createdAt: app.createdAt instanceof Date ? app.createdAt.toISOString() : String(app.createdAt),
      updatedAt: app.updatedAt instanceof Date ? app.updatedAt.toISOString() : String(app.updatedAt),
    };
  },

  toListView(applications: Application[]): ApplicationView[] {
    return applications.map((app) => ApplicationMapper.toView(app));
  },
};
