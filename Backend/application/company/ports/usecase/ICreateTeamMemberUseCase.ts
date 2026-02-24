export interface ICreateTeamMemberDTO {
  fullName: string;
  email: string;
  role: "hr" | "interviewer";
  userId: string;
  companyIdFromToken?: string;
}

export interface ICreateTeamMemberUseCase {
  execute(dto: ICreateTeamMemberDTO): Promise<{ message: string; userId: string }>;
}
