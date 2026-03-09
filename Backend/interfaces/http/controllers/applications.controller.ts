import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { success } from '../../../shared/http/apiResponse';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { IListJobsUseCase } from '../../../application/job/ports/usecase/IListJobsUseCase.js';
import type { IListPendingApplicationsForJobUseCase } from '../../../application/application/ports/usecase/IListPendingApplicationsForJobUseCase.js';
import type { IScoreCandidatesUseCase } from '../../../application/application/ports/usecase/IScoreCandidatesUseCase.js';
import type { IUpdateApplicationStatusUseCase } from '../../../application/application/ports/usecase/IUpdateApplicationStatusUseCase.js';
import type { IScheduleInterviewUseCase } from '../../../application/application/use-cases/schedule-interview.usecase.js';
import type { IDeclineRescheduleRequestUseCase } from '../../../application/application/use-cases/decline-reschedule-request.usecase.js';
import type { IGetResumeViewUrlUseCase } from '../../../application/application/use-cases/get-resume-view-url.usecase.js';
import { JobMapper } from '../../../application/job/mappers/JobMapper.js';
import { ApplicationMapper } from '../../../application/application/mappers/ApplicationMapper.js';

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
    @inject(TYPES.UpdateApplicationStatusUseCasePort)
    private readonly updateApplicationStatusUseCase: IUpdateApplicationStatusUseCase,
    @inject(TYPES.ScheduleInterviewUseCasePort)
    private readonly scheduleInterviewUseCase: IScheduleInterviewUseCase,
    @inject(TYPES.DeclineRescheduleRequestUseCasePort)
    private readonly declineRescheduleRequestUseCase: IDeclineRescheduleRequestUseCase,
    @inject(TYPES.GetResumeViewUrlUseCasePort)
    private readonly getResumeViewUrlUseCase: IGetResumeViewUrlUseCase
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
          | 'COMPLETED'
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
    const ctx = toContext(request.currentUser);
    const input = ApplicationMapper.toGetResumeViewUrlInput(request.params, ctx);
    const result = await this.getResumeViewUrlUseCase.execute(input);
    reply.send(success(result));
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
          | 'COMPLETED'
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
    const input = ApplicationMapper.toScheduleInterviewInput(request.params, request.body, ctx);
    const result = await this.scheduleInterviewUseCase.execute(input);
    reply.send(success({ application: ApplicationMapper.toView(result.application) }));
  };

  declineRescheduleRequest = async (
    request: FastifyRequest<{
      Params: { jobId: string; applicationId: string };
    }>,
    reply: FastifyReply
  ) => {
    const ctx = toContext(request.currentUser);
    const input = ApplicationMapper.toDeclineRescheduleRequestInput(request.params, ctx);
    const result = await this.declineRescheduleRequestUseCase.execute(input);
    reply.send(success({ application: ApplicationMapper.toView(result.application) }));
  };
}
