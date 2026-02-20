import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types';
import { UserRepositoryPort } from '../../shared/ports/repository/UserRepositoryPort.js';
import { ResolveCompanyForUserUseCase } from './ResolveCompanyForUserUseCase.js';
import type { ListTeamMembersUseCasePort, TeamMemberResponse } from '../ports/usecase/ListTeamMembersUseCasePort';

@injectable()
export class ListTeamMembersUseCase implements ListTeamMembersUseCasePort {
    constructor(
        @inject(TYPES.UserRepositoryPort) private readonly userRepository: UserRepositoryPort,
        @inject(ResolveCompanyForUserUseCase) private readonly resolveCompany: ResolveCompanyForUserUseCase
    ) {}

    async execute(
        userId: string,
        companyIdFromToken: string | undefined,
        role: 'hr' | 'interviewer',
        search?: string,
        status?: string
    ): Promise<{ data: TeamMemberResponse[] }> {
        const companyId = await this.resolveCompany.execute(userId, companyIdFromToken);
        const users = await this.userRepository.searchByCompanyIdAndRole(companyId, role, search, status);
        const data: TeamMemberResponse[] = users.map(user => ({
            id: user.id || '',
            fullName: user.fullName,
            email: user.email.getValue(),
            isActive: user.isActive,
        }));
        return { data };
    }
}
