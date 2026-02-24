import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { IUserRepository } from "../../shared/ports/repository/IUserRepository";
import { parseSearchParams } from "../../shared/utils/parseSearchParams";
import type { IGetAllCandidatesUseCase, ICandidateListItem } from "../ports/usecase/IGetAllCandidatesUseCase";

@injectable()
export class GetAllCandidatesUseCase implements IGetAllCandidatesUseCase {
    constructor(
        @inject(TYPES.UserRepositoryPort) private readonly userRepository: IUserRepository
    ) {}

    async execute(search?: string, status?: string, sortOrder: 'asc' | 'desc' = 'desc', page?: string, limit?: string): Promise<{ data: ICandidateListItem[]; total: number }> {
        const { page: parsedPage, limit: parsedLimit } = parseSearchParams({ page, limit });
        const { data: users, total } = await this.userRepository.findByRole('candidate', { search, status, sortOrder, page: parsedPage, limit: parsedLimit });

        const data: ICandidateListItem[] = users.map((user) => ({
            id: user.id || '',
            fullName: user.fullName,
            email: user.email.getValue(),
            isActive: user.isActive,
        }));

        return { data, total };
    }
}
