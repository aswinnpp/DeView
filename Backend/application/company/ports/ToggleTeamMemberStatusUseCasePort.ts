export interface ToggleTeamMemberStatusUseCasePort {
  execute(
    memberId: string,
    userId: string,
    companyIdFromToken?: string
  ): Promise<{ message: string; isActive: boolean }>;
}
