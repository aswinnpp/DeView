import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types';
import { UserRepositoryPort } from '../../shared/ports/repository/UserRepositoryPort.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { ResolveCompanyForUserUseCase } from './ResolveCompanyForUserUseCase.js';
import type { ToggleTeamMemberStatusUseCasePort } from '../ports/usecase/ToggleTeamMemberStatusUseCasePort';

@injectable()
export class ToggleTeamMemberStatusUseCase implements ToggleTeamMemberStatusUseCasePort {
    constructor(
        @inject(TYPES.UserRepositoryPort) private readonly userRepository: UserRepositoryPort,
        @inject(ResolveCompanyForUserUseCase) private readonly resolveCompany: ResolveCompanyForUserUseCase
    ) {}

    async execute(
        memberId: string,
        userId: string,
        companyIdFromToken?: string
    ): Promise<{ message: string; isActive: boolean }> {
        const companyId = await this.resolveCompany.execute(userId, companyIdFromToken);

        const user = await this.userRepository.findById(memberId);
        if (!user) {
            throw AppError.notFound('Team member not found');
        }

        if (user.companyId !== companyId) {
            throw AppError.forbidden('You do not have permission to modify this user');
        }

        const role = user.role.getValue();
        if (role !== 'hr' && role !== 'interviewer') {
            throw AppError.badRequest('Can only toggle status of HR or Interviewer accounts');
        }

        if (user.isActive) {
            user.deactivate();
        } else {
            user.activate();
        }

        await this.userRepository.save(user);

        const roleLabel = role === 'hr' ? 'HR' : 'Interviewer';
        const message = user.isActive ? `${roleLabel} activated` : `${roleLabel} deactivated`;
        return { message, isActive: user.isActive };
    }
}
