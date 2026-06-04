export interface IAiScoringService {
  getMatchScore(jobText: string, candidateText: string): Promise<number>;
}

