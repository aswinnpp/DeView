import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import { AppError } from '../../../shared/errors/AppError.js';
import type { ICandidateProfileRepository } from '../ports/repository/ICandidateProfileRepository.js';
import type { IJobRepository } from '../../job/ports/repository/IJobRepository.js';
import type { IJobApplicationRepository } from '../ports/repository/IJobApplicationRepository.js';
import type { IApplyForJobInput, IApplyForJobUseCase } from '../ports/usecase/IApplyForJobUseCase.js';

@injectable()
export class ApplyForJobUseCase implements IApplyForJobUseCase {
  constructor(
    @inject(TYPES.CandidateProfileRepositoryPort)
    private readonly candidateProfileRepo: ICandidateProfileRepository,
    @inject(TYPES.JobRepositoryPort)
    private readonly jobRepo: IJobRepository,
    @inject(TYPES.JobApplicationRepositoryPort)
    private readonly applicationRepo: IJobApplicationRepository,
  ) {}

  async execute(input: IApplyForJobInput): Promise<{ applicationId: string }> {
    const { jobId, candidateUserId, useResumeFromProfile, coverLetter, resumeUrl } = input;

    // 1. Get profile
    const profile = await this.candidateProfileRepo.findByUserId(candidateUserId);
    if (!profile) {
      throw AppError.badRequest('Profile not found. Please complete your profile before applying.');
    }

    // 2. Validate resume: if checkbox checked, profile must have resume
    if (useResumeFromProfile) {
      if (!profile.resumeUrl?.trim()) {
        throw AppError.badRequest('Resume not in profile. Please upload a resume to your profile or add a new resume below.');
      }
    } else {
      if (!resumeUrl?.trim()) {
        throw AppError.badRequest('Please upload a resume.');
      }
    }

    const effectiveResumeUrl = useResumeFromProfile ? profile.resumeUrl! : resumeUrl!;

    // 3. Get job
    const job = await this.jobRepo.findById(jobId);
    if (!job) {
      throw AppError.notFound('Job not found.');
    }
    if (job.status !== 'OPEN') {
      throw AppError.badRequest('This job is no longer accepting applications.');
    }
    if (job.applicants.some((a) => a.candidateUserId === candidateUserId)) {
      throw AppError.badRequest('You have already applied for this job.');
    }

    // 4. Create application with profile snapshot
    const applicationId = await this.applicationRepo.create({
      jobId,
      companyId: job.companyId,
      candidateUserId,
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      title: profile.title,
      currentCompany: profile.currentCompany,
      experience: profile.experience,
      bio: profile.bio,
      expectedSalary: profile.expectedSalary,
      noticePeriod: profile.noticePeriod,
      preferredWorkMode: profile.preferredWorkMode,
      preferredJobType: profile.preferredJobType,
      skills: profile.skills ?? [],
      education: profile.education,
      university: profile.university,
      graduationYear: profile.graduationYear,
      linkedinUrl: profile.linkedinUrl,
      githubUrl: profile.githubUrl,
      resumeUrl: effectiveResumeUrl,
      coverLetter: coverLetter?.trim() || undefined,
    });

    // 5. Add application detail to job applicants
    const now = new Date();
    job.applicants = [
      ...job.applicants,
      {
        applicationId,
        candidateUserId,
        fullName: profile.fullName,
        email: profile.email,
        status: 'PENDING' as const,
        appliedAt: now,
      },
    ];
    await this.jobRepo.save(job);

    return { applicationId };
  }
}
