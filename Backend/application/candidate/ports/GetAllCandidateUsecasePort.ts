export interface CandidateListItem {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt?: Date;
}

export interface GetAllCandidatesUseCasePort {
  execute(search?: string, status?: string, sortOrder?: 'asc' | 'desc'): Promise<{ data: CandidateListItem[] }>;
}
