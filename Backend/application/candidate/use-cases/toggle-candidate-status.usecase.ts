import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { IUserRepository } from "../../shared/ports/repository/IUserRepository";
import type { ITokenService } from "../../auth/ports/services/ITokenService";
import { AppError } from "../../../shared/errors/AppError";
import type { IToggleCandidateStatusUseCase } from "../ports/usecase/IToggleCandidateStatusUseCase";

@injectable()
export class ToggleCandidateStatusUseCase implements IToggleCandidateStatusUseCase {
    constructor(
        @inject(TYPES.UserRepositoryPort) private readonly userRepository: IUserRepository,
        @inject(TYPES.TokenServicePort) private readonly tokenService: ITokenService
    ) {}

    async execute(candidateId: string): Promise<{ message: string; isActive: boolean }> {
        const user = await this.userRepository.findById(candidateId);
        
        if (!user) {
            throw AppError.notFound('Candidate not found');
        }

        const role = user.role.getValue();
        if (role !== 'candidate') {
            throw AppError.badRequest('Can only toggle status of candidate accounts');
        }

        if (user.isActive) {
            user.deactivate();
            await this.tokenService.revokeAllUserTokens(candidateId);
        } else {
            user.activate();
        }

        await this.userRepository.save(user);

        const message = user.isActive ? 'Candidate activated' : 'Candidate deactivated';
        return { message, isActive: user.isActive };
    }
}
