import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import { AppError } from '../../../shared/errors/AppError.js';
import type { ICandidateProfileRepository } from '../ports/repository/ICandidateProfileRepository.js';
import type { IJobRepository } from '../../job/ports/repository/IJobRepository.js';
import type { IJobApplicationRepository } from '../ports/repository/IJobApplicationRepository.js';
import type { IApplyForJobInput, IApplyForJobUseCase } from '../ports/usecase/IApplyForJobUseCase.js';
import type { INotificationRepository } from '../../notification/ports/repository/INotificationRepository.js';
import type { INotificationPublisher } from '../../notification/ports/service/INotificationPublisher.js';

@injectable()
export class ApplyForJobUseCase implements IApplyForJobUseCase {
  constructor(
    @inject(TYPES.CandidateProfileRepositoryPort)
    private readonly _candidateProfileRepo: ICandidateProfileRepository,
    @inject(TYPES.JobRepositoryPort)
    private readonly _jobRepo: IJobRepository,
    @inject(TYPES.JobApplicationRepositoryPort)
    private readonly _applicationRepo: IJobApplicationRepository,
    @inject(TYPES.NotificationRepositoryPort)
    private readonly _notificationRepo: INotificationRepository,
    @inject(TYPES.NotificationPublisherPort)
    private readonly _notificationPublisher: INotificationPublisher,
  ) {}

  async execute(input: IApplyForJobInput): Promise<{ applicationId: string }> {
    const { jobId, candidateUserId, useResumeFromProfile, coverLetter, resumeUrl } = input;

    const profile = await this._candidateProfileRepo.findByUserId(candidateUserId);
    if (!profile) {
      throw AppError.badRequest('Profile not found. Please complete your profile before applying.');
    }

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

    const job = await this._jobRepo.findById(jobId);
    if (!job) {
      throw AppError.notFound('Job not found.');
    }
    if (job.status !== 'OPEN') {
      throw AppError.badRequest('This job is no longer accepting applications.');
    }
    if (job.applicants.some((a) => a.candidateUserId === candidateUserId)) {
      throw AppError.badRequest('You have already applied for this job.');
    }

    const applicationId = await this._applicationRepo.create({
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
      educationList: profile.educationList ?? [],
      workExperience: profile.workExperience ?? [],
      linkedinUrl: profile.linkedinUrl,
      githubUrl: profile.githubUrl,
      resumeUrl: effectiveResumeUrl,
      coverLetter: coverLetter?.trim() || undefined,
    });

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
    await this._jobRepo.save(job);

    const notification = await this._notificationRepo.create({
      recipientType: "COMPANY",
      recipientId: job.companyId,
      type: "NEW_APPLICATION",
      title: "New application",
      message: `New application received for ${job.title}`,
      data: { jobId: job.id, applicationId, candidateUserId },
    });
    await this._notificationPublisher.publish({
      recipientType: "COMPANY",
      recipientId: job.companyId,
      notification,
    });

    return { applicationId };
  }
}
