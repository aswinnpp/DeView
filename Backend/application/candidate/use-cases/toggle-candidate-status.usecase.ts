import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { IUserRepository } from "../../shared/ports/repository/IUserRepository";
import type { ITokenService } from "../../auth/ports/services/ITokenService";
import { AppError } from "../../../shared/errors/AppError";
import type { IToggleCandidateStatusUseCase } from "../ports/usecase/IToggleCandidateStatusUseCase";

@injectable()
export class ToggleCandidateStatusUseCase implements IToggleCandidateStatusUseCase {
    constructor(
        @inject(TYPES.UserRepositoryPort) private readonly _userRepository: IUserRepository,
        @inject(TYPES.TokenServicePort) private readonly _tokenService: ITokenService
    ) {}

    async execute(candidateId: string): Promise<{ message: string; isActive: boolean }> {
        const user = await this._userRepository.findById(candidateId);
        
        if (!user) {
            throw AppError.notFound('Candidate not found');
        }

        const role = user.role.getValue();
        if (role !== 'candidate') {
            throw AppError.badRequest('Can only toggle status of candidate accounts');
        }

        if (user.isActive) {
            user.deactivate();
            await this._tokenService.revokeAllUserTokens(candidateId);
        } else {
            user.activate();
        }

        await this._userRepository.save(user);

        const message = user.isActive ? 'Candidate activated' : 'Candidate deactivated';
        return { message, isActive: user.isActive };
    }
}
