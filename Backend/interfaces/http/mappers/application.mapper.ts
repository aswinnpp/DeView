import type { Application } from '../../../domain/application/entities/Application.js';
import type { ApplicationStatus } from '../../../domain/application/entities/Application.js';
import type { IAuthenticatedUser } from '../middleware/authMiddleware.js';
import type { IListPendingApplicationsInput } from '../../../application/application/ports/usecase/IListPendingApplicationsForJobUseCase.js';
import type {
  IScoreCandidatesInput,
  IScoreCandidateInput,
} from '../../../application/application/ports/usecase/IScoreCandidatesUseCase.js';

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
  aiScore?: number;
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
      aiScore: app.aiScore,
      createdAt: app.createdAt instanceof Date ? app.createdAt.toISOString() : String(app.createdAt),
      updatedAt: app.updatedAt instanceof Date ? app.updatedAt.toISOString() : String(app.updatedAt),
    };
  },

  toListView(applications: Application[]): ApplicationView[] {
    return applications.map((app) => ApplicationMapper.toView(app));
  },

  toListPendingInput(
    params: { jobId: string },
    query: { status?: 'PENDING' | 'SHORTLISTED' | 'REJECTED' },
    user: IAuthenticatedUser
  ): IListPendingApplicationsInput {
    return {
      jobId: params.jobId,
      companyId: user.companyId || '',
      status: query?.status as ApplicationStatus | undefined,
    };
  },

  toScoreCandidatesInput(
    params: { jobId: string },
    body: { candidates: unknown[] },
    user: IAuthenticatedUser
  ): IScoreCandidatesInput {
    const candidates = (Array.isArray(body?.candidates) ? body.candidates : []).map(
      (c): IScoreCandidateInput => ({
        applicationId: String((c as Record<string, unknown>)?.applicationId ?? ''),
        name: String((c as Record<string, unknown>)?.name ?? ''),
        email: (c as Record<string, unknown>)?.email != null ? String((c as Record<string, unknown>).email) : undefined,
        phone: (c as Record<string, unknown>)?.phone != null ? String((c as Record<string, unknown>).phone) : undefined,
        location: (c as Record<string, unknown>)?.location != null ? String((c as Record<string, unknown>).location) : undefined,
        experience: (c as Record<string, unknown>)?.experience != null ? String((c as Record<string, unknown>).experience) : undefined,
        education: (c as Record<string, unknown>)?.education != null ? String((c as Record<string, unknown>).education) : undefined,
        skills: (c as Record<string, unknown>)?.skills != null ? String((c as Record<string, unknown>).skills) : undefined,
        coverLetter: (c as Record<string, unknown>)?.coverLetter != null ? String((c as Record<string, unknown>).coverLetter) : undefined,
        bio: (c as Record<string, unknown>)?.bio != null ? String((c as Record<string, unknown>).bio) : undefined,
        title: (c as Record<string, unknown>)?.title != null ? String((c as Record<string, unknown>).title) : undefined,
        currentCompany: (c as Record<string, unknown>)?.currentCompany != null ? String((c as Record<string, unknown>).currentCompany) : undefined,
        expectedSalary: (c as Record<string, unknown>)?.expectedSalary != null ? String((c as Record<string, unknown>).expectedSalary) : undefined,
        noticePeriod: (c as Record<string, unknown>)?.noticePeriod != null ? String((c as Record<string, unknown>).noticePeriod) : undefined,
        preferredWorkMode: (c as Record<string, unknown>)?.preferredWorkMode != null ? String((c as Record<string, unknown>).preferredWorkMode) : undefined,
        preferredJobType: (c as Record<string, unknown>)?.preferredJobType != null ? String((c as Record<string, unknown>).preferredJobType) : undefined,
        university: (c as Record<string, unknown>)?.university != null ? String((c as Record<string, unknown>).university) : undefined,
        graduationYear: (c as Record<string, unknown>)?.graduationYear != null ? String((c as Record<string, unknown>).graduationYear) : undefined,
        linkedinUrl: (c as Record<string, unknown>)?.linkedinUrl != null ? String((c as Record<string, unknown>).linkedinUrl) : undefined,
        githubUrl: (c as Record<string, unknown>)?.githubUrl != null ? String((c as Record<string, unknown>).githubUrl) : undefined,
      })
    );
    return {
      jobId: params.jobId,
      companyId: user.companyId || '',
      candidates,
    };
  },
};
