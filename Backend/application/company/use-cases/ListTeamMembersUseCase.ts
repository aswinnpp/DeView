import { UserRepository } from '../../../domain/user/repositories/UserRepository.js';

interface TeamMemberResponse {
    id: string;
    fullName: string;
    email: string;
    isActive: boolean;
    createdAt?: string;
}

export class ListTeamMembersUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(
        companyId: string,
        role: 'hr' | 'interviewer',
        search?: string,
        status?: string
    ): Promise<TeamMemberResponse[]> {
        const users = await this.userRepository.searchByCompanyIdAndRole(companyId, role, search, status);

        return users.map(user => ({
            id: user.id || '',
            fullName: user.fullName,
            email: user.email.getValue(),
            isActive: user.isActive,
        }));
    }
}
