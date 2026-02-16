import { injectable, inject } from 'inversify';
import { TYPES } from '../../../infrastructure/di/types';
import { UserRepository } from '../../../domain/user/repositories/UserRepository.js';
import { ResolveCompanyForUserUseCase } from './ResolveCompanyForUserUseCase.js';

export interface TeamMemberResponse {
    id: string;
    fullName: string;
    email: string;
    isActive: boolean;
    createdAt?: string;
}

@injectable()
export class ListTeamMembersUseCase {
    constructor(
        @inject(TYPES.UserRepository) private readonly userRepository: UserRepository,
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
        const data = users.map(user => ({
            id: user.id || '',
            fullName: user.fullName,
            email: user.email.getValue(),
            isActive: user.isActive,
        }));
        return { data };
    }
}
