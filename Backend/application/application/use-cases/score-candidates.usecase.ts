import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IJobRepository } from '../../job/ports/repository/IJobRepository.js';
import type { IApplicationRepository } from '../ports/repository/IApplicationRepository.js';
import type {
  IScoreCandidatesUseCase,
  IScoreCandidatesInput,
  IScoreResult,
} from '../ports/usecase/IScoreCandidatesUseCase.js';
import {
  buildCandidateProfileText,
  buildJobDescriptionText,
} from '../../shared/utils/scoreCandidatesHelpers.js';
import type { IAiScoringService } from '../../shared/ports/services/IAiScoringService.js';
import { AppError } from '../../../shared/errors/AppError.js';

@injectable()
export class ScoreCandidatesUseCase implements IScoreCandidatesUseCase {
  constructor(
    @inject(TYPES.JobRepositoryPort) private readonly jobRepo: IJobRepository,
    @inject(TYPES.ApplicationRepositoryPort) private readonly applicationRepo: IApplicationRepository,
    @inject(TYPES.AiScoringServicePort) private readonly aiScoringService: IAiScoringService
  ) {}

  async execute(input: IScoreCandidatesInput): Promise<{ scores: IScoreResult[] }> {
    const job = await this.jobRepo.findById(input.jobId);
    if (!job) {
      throw AppError.notFound('Job not found.');
    }
    if (job.companyId !== input.companyId) {
      throw AppError.forbidden('Job does not belong to your company.');
    }

    const jobText = buildJobDescriptionText({
      title: job.title,
      description: job.description,
      qualifications: job.qualifications,
      skills: job.skills,
      responsibilities: job.responsibilities,
      experienceLevel: job.experienceLevel,
      department: job.department,
    });

    const scores: IScoreResult[] = [];

    for (const candidate of input.candidates) {
      const candidateText = buildCandidateProfileText(candidate);
      const matchScore = await this.aiScoringService.getMatchScore(jobText, candidateText);
      scores.push({ applicationId: candidate.applicationId, matchScore });
    }

    await this.applicationRepo.updateAiScores(
      input.jobId,
      input.companyId,
      scores.map((s) => ({ applicationId: s.applicationId, aiScore: s.matchScore }))
    );

    return { scores };
  }
}
