import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { success } from '../../../shared/http/apiResponse';
import { TYPES } from '../../../infrastructure/di/types.js';
import type { IListAllJobsForCandidatesUseCase } from '../../../application/candidate/ports/usecase/IListAllJobsForCandidatesUseCase.js';
import type { IApplyForJobUseCase } from '../../../application/candidate/ports/usecase/IApplyForJobUseCase.js';
import type { IListMyApplicationsUseCase } from '../../../application/candidate/ports/usecase/IListMyApplicationsUseCase.js';
import { ListCandidateMailboxUseCase } from '../../../application/candidate/use-cases/list-candidate-mailbox.usecase.js';
import { SubmitOfferCounterLetterUseCase } from '../../../application/candidate/use-cases/submit-offer-counter-letter.usecase.js';
import { RespondToOfferLetterUseCase } from '../../../application/candidate/use-cases/respond-to-offer-letter.usecase.js';
import { BeginOfferSigningUseCase } from '../../../application/candidate/use-cases/begin-offer-signing.usecase.js';
import { ConfirmOfferSigningUseCase } from '../../../application/candidate/use-cases/confirm-offer-signing.usecase.js';
import { GetSignedOfferPdfUseCase } from '../../../application/job-application/use-cases/get-signed-offer-pdf.usecase.js';
import { JobMapper } from '../../../application/job/mappers/JobMapper.js';
import { ApplicationMapper } from '../../../application/job-application/mappers/ApplicationMapper.js';
import { candidateMailboxListQuerySchema } from '../schemas/candidate-mailbox.schema.js';

interface ApplyBody {
  useResumeFromProfile: boolean;
  coverLetter?: string;
  resumeUrl?: string;
}

interface ApplyParams {
  jobId: string;
}

@injectable()
export class CandidateJobsController {
  constructor(
    @inject(TYPES.ListAllJobsForCandidatesUseCasePort)
    private readonly _listAllJobsUseCase: IListAllJobsForCandidatesUseCase,
    @inject(TYPES.ApplyForJobUseCasePort)
    private readonly _applyForJobUseCase: IApplyForJobUseCase,
    @inject(TYPES.ListMyApplicationsUseCasePort)
    private readonly _listMyApplicationsUseCase: IListMyApplicationsUseCase,
    @inject(ListCandidateMailboxUseCase)
    private readonly _listCandidateMailboxUseCase: ListCandidateMailboxUseCase,
    @inject(SubmitOfferCounterLetterUseCase)
    private readonly _submitOfferCounterLetterUseCase: SubmitOfferCounterLetterUseCase,
    @inject(RespondToOfferLetterUseCase)
    private readonly _respondToOfferLetterUseCase: RespondToOfferLetterUseCase,
    @inject(BeginOfferSigningUseCase)
    private readonly _beginOfferSigningUseCase: BeginOfferSigningUseCase,
    @inject(ConfirmOfferSigningUseCase)
    private readonly _confirmOfferSigningUseCase: ConfirmOfferSigningUseCase,
    @inject(GetSignedOfferPdfUseCase)
    private readonly _getSignedOfferPdfUseCase: GetSignedOfferPdfUseCase
  ) {}

  applyForJob = async (
    request: FastifyRequest<{ Params: ApplyParams; Body: ApplyBody }>,
    reply: FastifyReply
  ) => {
    const userId = request.currentUser.userId;
    const input = ApplicationMapper.toApplyForJobInput(request.params, request.body, userId);
    const result = await this._applyForJobUseCase.execute(input);

    reply.send(success(result));
  };

  listMyApplications = async (
    request: FastifyRequest<{
      Querystring: {
        search?: string;
        status?:
          | 'PENDING'
          | 'SHORTLISTED'
          | 'INTERVIEW_SCHEDULED'
          | 'INTERVIEW_COMPLETE'
          | 'COMPLETED'
          | 'HIRED'
          | 'REJECTED'
          | 'RESCHEDULE_REQUESTED';
        page?: number | string;
        limit?: number | string;
        sortOrder?: 'asc' | 'desc';
      };
    }>,
    reply: FastifyReply
  ) => {
    const userId = request.currentUser.userId;

    const result = await this._listMyApplicationsUseCase.execute(
      ApplicationMapper.toListMyApplicationsInput({
        candidateUserId: userId,
        search: request.query.search,
        status: request.query.status,
        page: request.query.page,
        limit: request.query.limit,
        sortOrder: request.query.sortOrder,
      }),
    );

    reply.send(success({ data: result.data, total: result.total }));
  };

  listMailbox = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.currentUser.userId;
    const query = candidateMailboxListQuerySchema.parse(request.query ?? {});
    const input = ApplicationMapper.toListCandidateMailboxInput(query, userId);
    const result = await this._listCandidateMailboxUseCase.execute(input);
    reply.send(success(result));
  };

  respondToOffer = async (
    request: FastifyRequest<{
      Params: { offerMailId: string };
      Body: { action: 'decline' };
    }>,
    reply: FastifyReply
  ) => {
    const userId = request.currentUser.userId;
    const input = ApplicationMapper.toRespondToOfferInput(request.params, userId);
    const offerPayload = await this._respondToOfferLetterUseCase.execute(input);
    reply.send(success(offerPayload));
  };

  beginOfferSigning = async (
    request: FastifyRequest<{ Params: { offerMailId: string } }>,
    reply: FastifyReply
  ) => {
    const userId = request.currentUser.userId;
    const result = await this._beginOfferSigningUseCase.execute({
      candidateUserId: userId,
      offerMailId: request.params.offerMailId,
    });
    reply.send(success(result));
  };

  confirmOfferSigning = async (
    request: FastifyRequest<{ Params: { offerMailId: string } }>,
    reply: FastifyReply
  ) => {
    const userId = request.currentUser.userId;
    const input = ApplicationMapper.toRespondToOfferInput(request.params, userId);
    const offerPayload = await this._confirmOfferSigningUseCase.execute({
      candidateUserId: input.candidateUserId,
      offerMailId: input.offerMailId,
    });
    reply.send(success(offerPayload));
  };

  downloadSignedOfferPdf = async (
    request: FastifyRequest<{ Params: { offerMailId: string } }>,
    reply: FastifyReply
  ) => {
    const userId = request.currentUser.userId;
    const input = ApplicationMapper.toCandidateGetSignedOfferPdfInput(request.params, userId);
    const pdf = await this._getSignedOfferPdfUseCase.execute(input);
    return reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', 'inline; filename="signed-offer.pdf"')
      .send(pdf);
  };

  submitOfferCounter = async (
    request: FastifyRequest<{
      Params: { offerMailId: string };
      Body: {
        letter?: string;
        salary?: string;
        location?: string;
        startDate?: string;
        benefits?: string;
        positionTitle?: string;
      };
    }>,
    reply: FastifyReply
  ) => {
    const userId = request.currentUser.userId;
    const input = ApplicationMapper.toSubmitOfferCounterInput(request.params, request.body, userId);
    const result = await this._submitOfferCounterLetterUseCase.execute(input);
    reply.send(success(result));
  };

  getAllJobs = async (
    request: FastifyRequest<{
      Querystring: { search?: string; status?: 'OPEN' | 'CLOSED'; jobType?: string; page?: number; limit?: number; sortBy?: 'date' | 'salary' | 'title'; sortOrder?: 'asc' | 'desc' };
    }>,
    reply: FastifyReply
  ) => {
    const input = JobMapper.toListAllForCandidatesInput(request.query);
    const result = await this._listAllJobsUseCase.execute(input);
    reply.send(success(result));
  };
}
