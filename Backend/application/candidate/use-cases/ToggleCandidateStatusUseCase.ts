import { injectable, inject } from 'inversify';
import { TYPES } from "../../../shared/di/types";
import { UserRepositoryPort } from "../../shared/ports/repository/UserRepositoryPort";
import type { TokenServicePort } from "../../auth/ports/services/TokenServicePort";
import { AppError } from "../../../shared/errors/AppError";
import type { ToggleCandidateStatusUseCasePort } from "../ports/usecase/ToggleCandidateStatusUseCasePort";

@injectable()
export class ToggleCandidateStatusUseCase implements ToggleCandidateStatusUseCasePort {
    constructor(
        @inject(TYPES.UserRepositoryPort) private readonly userRepository: UserRepositoryPort,
        @inject(TYPES.TokenServicePort) private readonly tokenService: TokenServicePort
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
