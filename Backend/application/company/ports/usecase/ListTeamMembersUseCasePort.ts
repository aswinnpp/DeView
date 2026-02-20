export interface TeamMemberResponse {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt?: string;
}

export interface ListTeamMembersUseCasePort {
  execute(
    userId: string,
    companyIdFromToken: string | undefined,
    role: "hr" | "interviewer",
    search?: string,
    status?: string
  ): Promise<{ data: TeamMemberResponse[] }>;
}
