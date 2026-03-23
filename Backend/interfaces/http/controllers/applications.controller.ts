import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { success } from '../../../shared/http/apiResponse';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { IListJobsUseCase } from '../../../application/job/ports/usecase/IListJobsUseCase.js';
import type { IListPendingApplicationsForJobUseCase } from '../../../application/job-application/ports/usecase/IListPendingApplicationsForJobUseCase.js';
import type { IScoreCandidatesUseCase } from '../../../application/job-application/ports/usecase/IScoreCandidatesUseCase.js';
import type { IUpdateApplicationStatusUseCase } from '../../../application/job-application/ports/usecase/IUpdateApplicationStatusUseCase.js';
import type { IScheduleInterviewUseCase } from '../../../application/job-application/use-cases/schedule-interview.usecase.js';
import type { IDeclineRescheduleRequestUseCase } from '../../../application/job-application/use-cases/decline-reschedule-request.usecase.js';
import type { IGetResumeViewUrlUseCase } from '../../../application/job-application/use-cases/get-resume-view-url.usecase.js';
import type { IGetLatestInterviewerFeedbackUseCase } from '../../../application/job-application/use-cases/get-latest-interviewer-feedback.usecase.js';
import type { IPrecheckScheduleInterviewUseCase } from '../../../application/job-application/ports/usecase/IPrecheckScheduleInterviewUseCase';
import { ListOfferMailsUseCase } from '../../../application/job-application/use-cases/list-offer-mails.usecase.js';
import { RespondToCounterLetterUseCase } from '../../../application/job-application/use-cases/respond-to-counter-letter.usecase.js';
import { GetSignedOfferPdfUseCase } from '../../../application/job-application/use-cases/get-signed-offer-pdf.usecase.js';
import { JobMapper } from '../../../application/job/mappers/JobMapper.js';
import { ApplicationMapper } from '../../../application/job-application/mappers/ApplicationMapper.js';
import { applicationsListQuerySchema, offerMailsListQuerySchema } from '../schemas/applications.schema.js';

function toContext(user: { userId: string; companyId?: string }) {
  return { userId: user.userId, companyId: user.companyId };
}

@injectable()
export class ApplicationsController {
  constructor(
    @inject(TYPES.ListJobsUseCasePort) private readonly _listJobsUseCase: IListJobsUseCase,
    @inject(TYPES.ListPendingApplicationsForJobUseCasePort)
    private readonly _listPendingApplicationsUseCase: IListPendingApplicationsForJobUseCase,
    @inject(TYPES.ScoreCandidatesUseCasePort)
    private readonly _scoreCandidatesUseCase: IScoreCandidatesUseCase,
    @inject(TYPES.UpdateApplicationStatusUseCasePort)
    private readonly _updateApplicationStatusUseCase: IUpdateApplicationStatusUseCase,
    @inject(TYPES.ScheduleInterviewUseCasePort)
    private readonly _scheduleInterviewUseCase: IScheduleInterviewUseCase,
    @inject(TYPES.PrecheckScheduleInterviewUseCasePort)
    private readonly _precheckScheduleInterviewUseCase: IPrecheckScheduleInterviewUseCase,
    @inject(TYPES.DeclineRescheduleRequestUseCasePort)
    private readonly _declineRescheduleRequestUseCase: IDeclineRescheduleRequestUseCase,
    @inject(TYPES.GetResumeViewUrlUseCasePort)
    private readonly _getResumeViewUrlUseCase: IGetResumeViewUrlUseCase,
    @inject(TYPES.GetLatestInterviewerFeedbackUseCasePort)
    private readonly _getLatestInterviewerFeedbackUseCase: IGetLatestInterviewerFeedbackUseCase,
    @inject(ListOfferMailsUseCase) private readonly _listOfferMailsUseCase: ListOfferMailsUseCase,
    @inject(RespondToCounterLetterUseCase) private readonly _respondToCounterLetterUseCase: RespondToCounterLetterUseCase,
    @inject(GetSignedOfferPdfUseCase) private readonly _getSignedOfferPdfUseCase: GetSignedOfferPdfUseCase
  ) {}

  listJobs = async (
    request: FastifyRequest<{
      Querystring: { search?: string; status?: 'OPEN' | 'CLOSED'; page?: number; limit?: number };
    }>,
    reply: FastifyReply
  ) => {
    const ctx = toContext(request.currentUser);
    const input = JobMapper.toListInput(request.query, ctx);
    const result = await this._listJobsUseCase.execute(input);
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
        pipelineTab?: 'pending' | 'shortlist' | 'interview' | 'interview_complete' | 'complete';
      };
    }>,
    reply: FastifyReply
  ) => {
    const query = applicationsListQuerySchema.parse(request.query);
    const ctx = toContext(request.currentUser);
    const input = ApplicationMapper.toListPendingInput(
      request.params,
      query,
      ctx
    );
    const result = await this._listPendingApplicationsUseCase.execute(input);
    const data = ApplicationMapper.toListView(result.data);
    reply.send(success({ data, counts: result.counts }));
  };

  getResumeViewUrl = async (
    request: FastifyRequest<{ Params: { jobId: string; applicationId: string } }>,
    reply: FastifyReply
  ) => {
    const ctx = toContext(request.currentUser);
    const input = ApplicationMapper.toGetResumeViewUrlInput(request.params, ctx);
    const result = await this._getResumeViewUrlUseCase.execute(input);
    reply.send(success(result));
  };

  precheckScheduleInterview = async (
    request: FastifyRequest<{
      Params: { jobId: string; applicationId: string };
      Querystring: { scheduledDate?: string };
    }>,
    reply: FastifyReply
  ) => {
    const ctx = toContext(request.currentUser);
    const input = ApplicationMapper.toPrecheckScheduleInterviewInput(
      request.params,
      request.query ?? {},
      ctx
    );
    await this._precheckScheduleInterviewUseCase.execute(input);
    reply.send(success({ ok: true }));
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
    const result = await this._scoreCandidatesUseCase.execute(input);
    reply.send(success(result));
  };

  listOfferMails = async (
    request: FastifyRequest<{
      Querystring: {
        jobId?: string;
        status?: 'pending' | 'accepted' | 'declined' | 'counter';
        search?: string;
        page?: number;
        limit?: number;
      };
    }>,
    reply: FastifyReply
  ) => {
    const ctx = toContext(request.currentUser);
    const query = offerMailsListQuerySchema.parse(request.query ?? {});
    const result = await this._listOfferMailsUseCase.execute({
      companyId: ctx.companyId ?? '',
      jobId: query.jobId,
      status: query.status,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
    const data = result.data.map((m) => {
      const mid = m.id ?? '';
      const fromNew = mid ? result.counterLettersByOfferMailId.get(mid) : undefined;
      const fromLegacy = mid && !fromNew ? result.legacyEmbeddedCounters.get(mid) : undefined;
      const counterLetter = fromNew?.content ?? fromLegacy?.content;
      const counterSentAtRaw = fromNew?.createdAt ?? fromLegacy?.sentAt;
      const counterSentAt =
        counterSentAtRaw instanceof Date ? counterSentAtRaw.toISOString() : counterSentAtRaw ? String(counterSentAtRaw) : undefined;
      const counterResponseStatus = fromNew?.responseStatus === 'accepted' || fromNew?.responseStatus === 'rejected'
        ? fromNew.responseStatus
        : undefined;
      const signedOfferAvailable =
        m.status === 'accepted' && Boolean(m.docusignAcceptanceEnvelopeId?.trim());
      return {
        id: m.id,
        applicationId: m.applicationId,
        jobId: m.jobId,
        companyId: m.companyId,
        candidateUserId: m.candidateUserId,
        candidateName: m.candidateName,
        candidateEmail: m.candidateEmail,
        content: m.content,
        salary: m.salary,
        location: m.location,
        startDate: m.startDate,
        benefits: m.benefits,
        status: m.status,
        ...(counterLetter !== undefined && { counterLetter }),
        ...(counterSentAt !== undefined && { counterSentAt }),
        ...(counterResponseStatus !== undefined && { counterResponseStatus }),
        ...(signedOfferAvailable && { signedOfferAvailable: true }),
        createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
      };
    });
    reply.send(success({ data, total: result.total }));
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
        offerEmailContent?: string;
        offerSalary?: string;
        offerLocation?: string;
        offerStartDate?: string;
        offerBenefits?: string;
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
    const result = await this._updateApplicationStatusUseCase.execute(input);
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
        slotStartIso?: string;
      };
    }>,
    reply: FastifyReply
  ) => {
    const ctx = toContext(request.currentUser);
    const input = ApplicationMapper.toScheduleInterviewInput(request.params, request.body, ctx);
    const result = await this._scheduleInterviewUseCase.execute(input);
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
    const result = await this._declineRescheduleRequestUseCase.execute(input);
    reply.send(success({ application: ApplicationMapper.toView(result.application) }));
  };

  getLatestInterviewerFeedback = async (
    request: FastifyRequest<{ Params: { jobId: string; applicationId: string } }>,
    reply: FastifyReply
  ) => {
    const ctx = toContext(request.currentUser);
    const result = await this._getLatestInterviewerFeedbackUseCase.execute({
      companyId: ctx.companyId ?? '',
      jobId: request.params.jobId,
      applicationId: request.params.applicationId,
    });
    reply.send(success(result));
  };

  respondToCounterLetter = async (
    request: FastifyRequest<{
      Params: { offerMailId: string };
      Body: { action: 'accept' | 'reject' };
    }>,
    reply: FastifyReply
  ) => {
    const ctx = toContext(request.currentUser);
    const companyId = ctx.companyId ?? '';
    const action = request.body?.action;
    if (action !== 'accept' && action !== 'reject') {
      return reply.status(400).send({ success: false, message: 'action must be accept or reject' });
    }
    const result = await this._respondToCounterLetterUseCase.execute({
      offerMailId: request.params.offerMailId,
      companyId,
      action,
    });
    reply.send(success(result));
  };

  downloadOfferSignedPdf = async (
    request: FastifyRequest<{ Params: { offerMailId: string } }>,
    reply: FastifyReply
  ) => {
    const ctx = toContext(request.currentUser);
    const companyId = ctx.companyId ?? '';
    if (!companyId) {
      return reply.status(403).send({ success: false, message: 'Forbidden' });
    }
    const pdf = await this._getSignedOfferPdfUseCase.execute({
      offerMailId: request.params.offerMailId,
      companyId,
    });
    return reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', 'inline; filename="signed-offer.pdf"')
      .send(pdf);
  };
}
