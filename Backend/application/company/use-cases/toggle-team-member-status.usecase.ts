import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types';
import { IUserRepository } from '../../shared/ports/repository/IUserRepository.js';
import type { ITokenService } from '../../auth/ports/services/ITokenService.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { ResolveCompanyForUserUseCase } from './resolve-company-for-user.usecase.js';
import type { IToggleTeamMemberStatusUseCase } from '../ports/usecase/IToggleTeamMemberStatusUseCase';

@injectable()
export class ToggleTeamMemberStatusUseCase implements IToggleTeamMemberStatusUseCase {
    constructor(
        @inject(TYPES.UserRepositoryPort) private readonly _userRepository: IUserRepository,
        @inject(TYPES.TokenServicePort) private readonly _tokenService: ITokenService,
        @inject(ResolveCompanyForUserUseCase) private readonly _resolveCompany: ResolveCompanyForUserUseCase
    ) {}

    async execute(
        memberId: string,
        userId: string,
        companyIdFromToken?: string
    ): Promise<{ message: string; isActive: boolean }> {
        const companyId = await this._resolveCompany.execute(userId, companyIdFromToken);

        const user = await this._userRepository.findById(memberId);
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
            await this._tokenService.revokeAllUserTokens(memberId);
        } else {
            user.activate();
        }

        await this._userRepository.save(user);

        const roleLabel = role === 'hr' ? 'HR' : 'Interviewer';
        const message = user.isActive ? `${roleLabel} activated` : `${roleLabel} deactivated`;
        return { message, isActive: user.isActive };
    }
}
