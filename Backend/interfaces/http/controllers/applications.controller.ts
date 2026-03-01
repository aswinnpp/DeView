import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { success } from '../../../shared/http/apiResponse';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { IListJobsUseCase } from '../../../application/job/ports/usecase/IListJobsUseCase.js';
import type { IListPendingApplicationsForJobUseCase } from '../../../application/application/ports/usecase/IListPendingApplicationsForJobUseCase.js';
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
    @inject(TYPES.ApplicationRepositoryPort) private readonly applicationRepository: IApplicationRepository,
    @inject(TYPES.FileStoragePort) private readonly fileStorage: IFileStorage
  ) {}

  /** List company jobs - reuse ListJobsUseCase */
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

  /** List pending applications for a job - company/HR only */
  listPendingApplications = async (
    request: FastifyRequest<{ Params: { jobId: string } }>,
    reply: FastifyReply
  ) => {
    const user = request.currentUser;
    const companyId = user.companyId || '';

    const result = await this.listPendingApplicationsUseCase.execute({
      jobId: request.params.jobId,
      companyId,
    });

    const data = ApplicationMapper.toListView(result.data);
    reply.send(success({ data }));
  };

  /** Get a fresh pre-signed URL to view an application's resume (company/HR only). Avoids expired S3 links. */
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
}
