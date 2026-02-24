export interface ICandidateListItem {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt?: Date;
}

export interface IGetAllCandidatesUseCase {
  execute(
    search?: string,
    status?: string,
    sortOrder?: "asc" | "desc",
    page?: string,
    limit?: string
  ): Promise<{ data: ICandidateListItem[]; total: number }>;
}
