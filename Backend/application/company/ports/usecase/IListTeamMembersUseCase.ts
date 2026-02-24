export interface ITeamMemberResponse {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt?: string;
}

export interface IListTeamMembersUseCase {
  execute(
    userId: string,
    companyIdFromToken: string | undefined,
    role: "hr" | "interviewer",
    search?: string,
    status?: string,
    page?: string,
    limit?: string
  ): Promise<{ data: ITeamMemberResponse[]; total: number }>;
}
