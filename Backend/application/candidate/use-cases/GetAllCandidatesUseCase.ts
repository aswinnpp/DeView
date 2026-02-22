import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { UserRepositoryPort } from "../../shared/ports/repository/UserRepositoryPort";
import { parseSearchParams } from "../../shared/utils/parseSearchParams";
import type { GetAllCandidatesUseCasePort, CandidateListItem } from "../ports/usecase/GetAllCandidateUsecasePort";

@injectable()
export class GetAllCandidatesUseCase implements GetAllCandidatesUseCasePort {
    constructor(
        @inject(TYPES.UserRepositoryPort) private readonly userRepository: UserRepositoryPort
    ) {}

    async execute(search?: string, status?: string, sortOrder: 'asc' | 'desc' = 'desc', page?: string, limit?: string): Promise<{ data: CandidateListItem[]; total: number }> {
        const { page: parsedPage, limit: parsedLimit } = parseSearchParams({ page, limit });
        const { data: users, total } = await this.userRepository.findByRole('candidate', { search, status, sortOrder, page: parsedPage, limit: parsedLimit });

        const data: CandidateListItem[] = users.map((user) => ({
            id: user.id || '',
            fullName: user.fullName,
            email: user.email.getValue(),
            isActive: user.isActive,
        }));

        return { data, total };
    }
}
