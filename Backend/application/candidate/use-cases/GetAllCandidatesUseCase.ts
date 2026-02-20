import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { UserRepositoryPort } from "../../shared/ports/repository/UserRepositoryPort";
import type { GetAllCandidatesUseCasePort, CandidateListItem } from "../ports/usecase/GetAllCandidateUsecasePort";

@injectable()
export class GetAllCandidatesUseCase implements GetAllCandidatesUseCasePort {
    constructor(
        @inject(TYPES.UserRepositoryPort) private readonly userRepository: UserRepositoryPort
    ) {}

    async execute(search?: string, status?: string, sortOrder: 'asc' | 'desc' = 'desc'): Promise<{ data: CandidateListItem[] }> {
        // Query users with role 'candidate' from user collection
        const users = await this.userRepository.searchByRole('candidate', search, status, sortOrder);
        
        const data: CandidateListItem[] = users.map(user => ({
            id: user.id || '',
            fullName: user.fullName,
            email: user.email.getValue(),
            isActive: user.isActive,
        }));

        return { data };
    }
}
