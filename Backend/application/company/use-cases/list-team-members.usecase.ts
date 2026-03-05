import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types';
import { IUserRepository } from '../../shared/ports/repository/IUserRepository.js';
import { parseSearchParams } from '../../shared/utils/parseSearchParams.js';
import { ResolveCompanyForUserUseCase } from './resolve-company-for-user.usecase.js';
import type { IListTeamMembersUseCase, ITeamMemberResponse } from '../ports/usecase/IListTeamMembersUseCase';

@injectable()
export class ListTeamMembersUseCase implements IListTeamMembersUseCase {
    constructor(
        @inject(TYPES.UserRepositoryPort) private readonly userRepository: IUserRepository,
        @inject(ResolveCompanyForUserUseCase) private readonly resolveCompany: ResolveCompanyForUserUseCase
    ) {}

    async execute(
        userId: string,
        companyIdFromToken: string | undefined,
        role: 'hr' | 'interviewer',
        search?: string,
        status?: string,
        page?: string,
        limit?: string
    ): Promise<{ data: ITeamMemberResponse[]; total: number }> {
        const { page: parsedPage, limit: parsedLimit } = parseSearchParams({ page, limit });
        const companyId = await this.resolveCompany.execute(userId, companyIdFromToken);
        const { data: users, total } = await this.userRepository.findByCompanyIdAndRole(companyId, role, { search, status, page: parsedPage, limit: parsedLimit });
        console.log('users', users);
        const data: ITeamMemberResponse[] = users.map((user) => ({
            id: user.id || '',
            fullName: user.fullName,
            email: user.email.getValue(),
            isActive: user.isActive,
        }));
        return { data, total };
    }
}
