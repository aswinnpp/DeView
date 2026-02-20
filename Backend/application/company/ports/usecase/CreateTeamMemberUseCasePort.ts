export interface CreateTeamMemberDTO {
  fullName: string;
  email: string;
  role: "hr" | "interviewer";
  userId: string;
  companyIdFromToken?: string;
}

export interface CreateTeamMemberUseCasePort {
  execute(dto: CreateTeamMemberDTO): Promise<{ message: string; userId: string }>;
}
