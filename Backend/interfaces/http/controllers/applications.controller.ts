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
import { JobMapper } from '../mappers/index.js';
import { ApplicationMapper } from '../mappers/index.js';

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
    private readonly updateApplicationStatusUseCase: IUpdateApplicationStatusUseCase
  ) {}

  listJobs = async (
    request: FastifyRequest<{
      Querystring: { search?: string; status?: 'OPEN' | 'CLOSED'; page?: number; limit?: number };
    }>,
    reply: FastifyReply
  ) => {
    const user = request.currentUser;
    const input = JobMapper.toListInput(request.query, user);
    const result = await this.listJobsUseCase.execute(input);
    reply.send(success(result));
  };

  listPendingApplications = async (
    request: FastifyRequest<{
      Params: { jobId: string };
      Querystring: { status?: 'PENDING' | 'SHORTLISTED' | 'REJECTED' };
    }>,
    reply: FastifyReply
  ) => {
    const input = ApplicationMapper.toListPendingInput(
      request.params,
      request.query,
      request.currentUser
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
   
    const input = ApplicationMapper.toScoreCandidatesInput(
      request.params,
      request.body as { candidates: unknown[] },
      request.currentUser
    );
    const result = await this.scoreCandidatesUseCase.execute(input);
    reply.send(success(result));
  };

  updateStatus = async (
    request: FastifyRequest<{
      Params: { jobId: string; applicationId: string };
      Body: { status: 'PENDING' | 'SHORTLISTED' | 'REJECTED'; rejectionEmailContent?: string };
    }>,
    reply: FastifyReply
  ) => {
    const input = ApplicationMapper.toUpdateStatusInput(
      request.params,
      request.body,
      request.currentUser
    );
    const result = await this.updateApplicationStatusUseCase.execute(input);
    const application = ApplicationMapper.toView(result.application);
    reply.send(success({ application }));
  };
}
