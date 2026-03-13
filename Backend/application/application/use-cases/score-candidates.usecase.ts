import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types.js';
import type { IJobRepository } from '../../job/ports/repository/IJobRepository.js';
import type { IApplicationRepository } from '../ports/repository/IApplicationRepository.js';
import type { IScoreCandidatesUseCase } from '../ports/usecase/IScoreCandidatesUseCase.js';
import type {
  IScoreCandidatesInputDTO,
  IScoreResultDTO,
  IScoreCandidatesResultDTO,
} from '../dtos/ScoreCandidatesDTO.js';
import {
  buildCandidateProfileText,
  buildJobDescriptionText,
} from '../../shared/utils/scoreCandidatesHelpers.js';
import type { IAiScoringService } from '../../shared/ports/services/IAiScoringService.js';
import { AppError } from '../../../shared/errors/AppError.js';

@injectable()
export class ScoreCandidatesUseCase implements IScoreCandidatesUseCase {
  constructor(
    @inject(TYPES.JobRepositoryPort) private readonly _jobRepo: IJobRepository,
    @inject(TYPES.ApplicationRepositoryPort) private readonly _applicationRepo: IApplicationRepository,
    @inject(TYPES.AiScoringServicePort) private readonly _aiScoringService: IAiScoringService
  ) {}

  async execute(input: IScoreCandidatesInputDTO): Promise<IScoreCandidatesResultDTO> {
    const job = await this._jobRepo.findById(input.jobId);
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

    const scores: IScoreResultDTO[] = [];

    for (const candidate of input.candidates) {
      const candidateText = buildCandidateProfileText(candidate);
      const matchScore = await this._aiScoringService.getMatchScore(jobText, candidateText);
      scores.push({ applicationId: candidate.applicationId, matchScore });
    }

    await this._applicationRepo.updateAiScores(
      input.jobId,
      input.companyId,
      scores.map((s) => ({ applicationId: s.applicationId, aiScore: s.matchScore }))
    );

    return { scores };
  }
}
