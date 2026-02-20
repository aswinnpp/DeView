export interface ToggleCandidateStatusUseCasePort {
  execute(candidateId: string): Promise<{ message: string; isActive: boolean }>;
}
