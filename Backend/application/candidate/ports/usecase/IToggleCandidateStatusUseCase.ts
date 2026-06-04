export interface IToggleCandidateStatusUseCase {
  execute(candidateId: string): Promise<{ message: string; isActive: boolean }>;
}
