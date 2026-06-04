import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IInterviewRepository } from '../ports/repository/IInterviewRepository.js';
import type { IInterviewFeedbackRepository } from '../ports/repository/IInterviewFeedbackRepository.js';
import type { IApplicationRepository } from '../../job-application/ports/repository/IApplicationRepository.js';
import type { IJobRepository } from '../../job/ports/repository/IJobRepository.js';
import type { IUpdateApplicationStatusUseCase } from '../../job-application/ports/usecase/IUpdateApplicationStatusUseCase.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { InterviewFeedback } from '../../../domain/entities/InterviewFeedback.js';
import type { Application } from '../../../domain/entities/Application.js';
import type { ISaveInterviewFeedbackUseCase } from '../ports/usecase/ISaveInterviewFeedbackUseCase.js';
import type {
  ISaveInterviewFeedbackInputDTO,
  ISaveInterviewFeedbackOutputDTO,
} from '../dtos/InterviewCommandDTO.js';

const PASS_SCORE = 5;

function roundFeedback(app: Application, round: string) {
  const fromArr = app.interviewRounds?.find((x) => x.round === round);
  if (fromArr) return fromArr;
  return undefined;
}

@injectable()
export class SaveInterviewFeedbackUseCase implements ISaveInterviewFeedbackUseCase {
  constructor(
    @inject(TYPES.InterviewRepositoryPort) private readonly _interviewRepo: IInterviewRepository,
    @inject(TYPES.InterviewFeedbackRepositoryPort)
    private readonly _feedbackRepo: IInterviewFeedbackRepository,
    @inject(TYPES.ApplicationRepositoryPort) private readonly _applicationRepo: IApplicationRepository,
    @inject(TYPES.JobRepositoryPort) private readonly _jobRepo: IJobRepository,
    @inject(TYPES.UpdateApplicationStatusUseCasePort)
    private readonly _updateApplicationStatus: IUpdateApplicationStatusUseCase
  ) {}

  async execute(input: ISaveInterviewFeedbackInputDTO): Promise<ISaveInterviewFeedbackOutputDTO> {
    const { interviewId, interviewerUserId, totalScore, feedback } = input;

    if (!feedback.trim()) {
      throw AppError.badRequest('Feedback is required');
    }

    if (!Number.isFinite(totalScore) || totalScore < 1 || totalScore > 10) {
      throw AppError.badRequest('Total score must be between 1 and 5');
    }

    const interview = await this._interviewRepo.findById(interviewId);
    if (!interview) {
      throw AppError.notFound('Interview not found');
    }
    if (interview.interviewerUserId !== interviewerUserId) {
      throw AppError.forbidden('You are not allowed to submit feedback for this interview');
    }
    if (interview.status !== 'COMPLETED') {
      throw AppError.badRequest('Feedback can only be submitted for completed interviews');
    }

    const now = new Date();
    const feedbackEntity = new InterviewFeedback(
      null,
      interview.id ?? interviewId,
      interview.candidateUserId,
      interview.companyId,
      interview.companyName,
      interview.jobId,
      interviewerUserId,
      interview.interviewerName,
      interview.round,
      feedback.trim(),
      totalScore,
      interview.interviewType,
      interview.interviewLocation,
      now,
      now
    );

    await this._feedbackRepo.create(feedbackEntity);
    await this._interviewRepo.setFeedbackSubmitted(interview.id ?? interviewId, true);

    await this._applicationRepo.updateInterviewFeedback({
      applicationId: interview.applicationId,
      jobId: interview.jobId,
      companyId: interview.companyId,
      round: interview.round,
      feedback: feedback.trim(),
      totalScore,
    });

    const appAfter = await this._applicationRepo.findByIdAndJobId(
      interview.applicationId,
      interview.jobId,
      interview.companyId
    );
    if (!appAfter) {
      return { success: true };
    }

    if (appAfter.status === 'REJECTED' || appAfter.status === 'HIRED') {
      return { success: true };
    }

    const job = await this._jobRepo.findById(interview.jobId);
    const jobRounds =
      job?.interviewRounds && job.interviewRounds.length > 0 ? job.interviewRounds : ['HR Screening'];

 

    const allRoundsPass = jobRounds.every((r) => {
      const fd = roundFeedback(appAfter, r);
      const s = fd?.totalScore;
      return typeof s === 'number' && s >= PASS_SCORE;
    });

    if (allRoundsPass) {
      await this._updateApplicationStatus.execute({
        applicationId: interview.applicationId,
        jobId: interview.jobId,
        companyId: interview.companyId,
        status: 'COMPLETED',
      });
    }

    return { success: true };
  }
}
