export interface IGetLandingStatsUseCase {
  execute(): Promise<{
    companies: number;
    interviewsConducted: number;
    developersHired: number;
  }>;
}

