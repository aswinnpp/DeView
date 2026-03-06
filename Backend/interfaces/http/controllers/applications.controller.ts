import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { success } from '../../../shared/http/apiResponse';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { IListJobsUseCase } from '../../../application/job/ports/usecase/IListJobsUseCase.js';
import type { IListPendingApplicationsForJobUseCase } from '../../../application/application/ports/usecase/IListPendingApplicationsForJobUseCase.js';
import type { IScoreCandidatesUseCase } from '../../../application/application/ports/usecase/IScoreCandidatesUseCase.js';
import type { IUpdateApplicationStatusUseCase } from '../../../application/application/ports/usecase/IUpdateApplicationStatusUseCase.js';
import type { IApplicationRepository } from '../../../application/application/ports/repository/IApplicationRepository.js';
import type { IFileStorage } from '../../../application/upload/ports/services/IFileStorage.js';
import type { IInterviewRepository } from '../../../application/interview/ports/repository/IInterviewRepository.js';
import type { ICompanyProfileRepository } from '../../../application/company/ports/repository/ICompanyProfileRepository.js';
import type { IJobRepository } from '../../../application/job/ports/repository/IJobRepository.js';
import { JobMapper } from '../../../application/job/mappers/JobMapper.js';
import { ApplicationMapper } from '../../../application/application/mappers/ApplicationMapper.js';
import { Interview } from '../../../domain/interview/entities/Interview.js';

function toContext(user: { userId: string; companyId?: string }) {
  return { userId: user.userId, companyId: user.companyId };
}

@injectable()
export class ApplicationsController {
  constructor(
    @inject(TYPES.ListJobsUseCasePort) private readonly listJobsUseCase: IListJobsUseCase,
    @inject(TYPES.ListPendingApplicationsForJobUseCasePort)
    private readonly listPendingApplicationsUseCase: IListPendingApplicationsForJobUseCase,
    @inject(TYPES.ScoreCandidatesUseCasePort)
    private readonly scoreCandidatesUseCase: IScoreCandidatesUseCase,
    @inject(TYPES.ApplicationRepositoryPort) private readonly applicationRepository: IApplicationRepository,
    @inject(TYPES.FileStoragePort) private readonly fileStorage: IFileStorage,
    @inject(TYPES.UpdateApplicationStatusUseCasePort)
    private readonly updateApplicationStatusUseCase: IUpdateApplicationStatusUseCase,
    @inject(TYPES.InterviewRepositoryPort) private readonly interviewRepository: IInterviewRepository,
    @inject(TYPES.CompanyProfileRepositoryPort)
    private readonly companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.JobRepositoryPort) private readonly jobRepository: IJobRepository
  ) {}

  listJobs = async (
    request: FastifyRequest<{
      Querystring: { search?: string; status?: 'OPEN' | 'CLOSED'; page?: number; limit?: number };
    }>,
    reply: FastifyReply
  ) => {
    const ctx = toContext(request.currentUser);
    const input = JobMapper.toListInput(request.query, ctx);
    const result = await this.listJobsUseCase.execute(input);
    reply.send(success(result));
  };

  listPendingApplications = async (
    request: FastifyRequest<{
      Params: { jobId: string };
      Querystring: {
        status?:
          | 'PENDING'
          | 'SHORTLISTED'
          | 'INTERVIEW_SCHEDULED'
          | 'INTERVIEW_COMPLETE'
          | 'HIRED'
          | 'REJECTED'
          | 'RESCHEDULE_REQUESTED';
      };
    }>,
    reply: FastifyReply
  ) => {
    const ctx = toContext(request.currentUser);
    const input = ApplicationMapper.toListPendingInput(
      request.params,
      request.query,
      ctx
    );
    const result = await this.listPendingApplicationsUseCase.execute(input);
    const data = ApplicationMapper.toListView(result.data);
    reply.send(success({ data }));
  };

  getResumeViewUrl = async (
    request: FastifyRequest<{ Params: { jobId: string; applicationId: string } }>,
    reply: FastifyReply
  ) => {
    const user = request.currentUser;
    const companyId = user.companyId || '';
    const { jobId, applicationId } = request.params;

    const application = await this.applicationRepository.findByIdAndJobId(
      applicationId,
      jobId,
      companyId
    );
    if (!application?.resumeUrl?.trim()) {
      return reply.status(404).send({ ok: false, error: 'Application or resume not found' });
    }

    const url = await this.fileStorage.getSignedViewUrl(application.resumeUrl, 3600);
    reply.send(success({ url }));
  };

  scoreCandidates = async (
    request: FastifyRequest<{
      Params: { jobId: string };
      Body: { candidates: unknown[] };
    }>,
    reply: FastifyReply
  ) => {
    const ctx = toContext(request.currentUser);
    const input = ApplicationMapper.toScoreCandidatesInput(
      request.params,
      request.body as { candidates: unknown[] },
      ctx
    );
    const result = await this.scoreCandidatesUseCase.execute(input);
    reply.send(success(result));
  };

  updateStatus = async (
    request: FastifyRequest<{
      Params: { jobId: string; applicationId: string };
      Body: {
        status:
          | 'PENDING'
          | 'SHORTLISTED'
          | 'INTERVIEW_SCHEDULED'
          | 'INTERVIEW_COMPLETE'
          | 'HIRED'
          | 'REJECTED'
          | 'RESCHEDULE_REQUESTED';
        rejectionEmailContent?: string;
      };
    }>,
    reply: FastifyReply
  ) => {
    const ctx = toContext(request.currentUser);
    const input = ApplicationMapper.toUpdateStatusInput(
      request.params,
      request.body,
      ctx
    );
    const result = await this.updateApplicationStatusUseCase.execute(input);
    const application = ApplicationMapper.toView(result.application);
    reply.send(success({ application }));
  };

  scheduleInterview = async (
    request: FastifyRequest<{
      Params: { jobId: string; applicationId: string };
      Body: {
        round: string;
        interviewerUserId: string;
        interviewerName: string;
        interviewerEmail?: string;
        scheduledDate: string;
        scheduledTime: string;
      };
    }>,
    reply: FastifyReply
  ) => {
    const ctx = toContext(request.currentUser);
    const { jobId, applicationId } = request.params;
    const body = request.body;

    const companyId = ctx.companyId || '';

    const roomName = `deview-interview-${applicationId}-${Date.now()}`;

    const updated = await this.applicationRepository.scheduleInterview({
      applicationId,
      jobId,
      companyId,
      interviewDetails: {
        round: String(body.round ?? '').trim(),
        interviewer: String(body.interviewerName ?? '').trim(),
        interviewerEmail: body.interviewerEmail ? String(body.interviewerEmail).trim() : undefined,
        scheduledDate: String(body.scheduledDate ?? '').trim(),
        scheduledTime: String(body.scheduledTime ?? '').trim(),
      },
    });

    if (!updated) {
      return reply.status(404).send({ ok: false, error: 'Application not found' });
    }

    // Create an interview record in interviews collection
    const companyProfile = companyId ? await this.companyProfileRepository.findById(companyId) : null;
    const companyName = companyProfile?.companyName ?? '';
    const job = await this.jobRepository.findById(jobId);
    const jobTitle = job?.title ?? '';

    await this.interviewRepository.create(
      new Interview(
        null,
        companyId,
        companyName,
        jobId,
        jobTitle,
        roomName,
        applicationId,
        updated.candidateUserId,
        updated.fullName,
        String(body.interviewerUserId ?? '').trim(),
        String(body.interviewerName ?? '').trim(),
        String(body.round ?? '').trim(),
        String(body.scheduledDate ?? '').trim(),
        String(body.scheduledTime ?? '').trim(),
        'SCHEDULED',
        false, // interviewerAccepted - interviewer must accept before candidate sees it
        undefined
      )
    );

    reply.send(success({ application: ApplicationMapper.toView(updated) }));
  };
}
