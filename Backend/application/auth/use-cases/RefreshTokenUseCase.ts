import { TokenServicePort } from '../ports/TokenServicePort.js';
import { UserRepository } from '../../../domain/user/repositories/UserRepository.js';
import { AppError } from '../../../shared/errors/AppError.js';

export interface RefreshTokenRequest {
    refreshTokenHash: string;
    deviceInfo: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    role: string;
    newRefreshToken: string;
}

export class RefreshTokenUseCase {
    constructor(
        private readonly tokenService: TokenServicePort,
        private readonly userRepository: UserRepository
    ) { }

    async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
        if (!request.refreshTokenHash) {
            throw AppError.unauthorized('No refresh token provided');
        }

        const existingToken = await (this.tokenService as any).refreshTokenRepository.findByTokenHash(
            request.refreshTokenHash
        );

        if (!existingToken || !existingToken.isValid()) {
            throw AppError.unauthorized('Invalid or expired refresh token');
        }

        const newTokenData = await this.tokenService.rotateRefreshToken(
            request.refreshTokenHash,
            request.deviceInfo
        );

        if (!newTokenData) {
            throw AppError.unauthorized('Failed to rotate refresh token');
        }

        const user = await this.userRepository.findById(existingToken.userId);
        if (!user) {
            throw AppError.unauthorized('User not found');
        }

        const accessToken = this.tokenService.signAccessToken({
            userId: user.id!,
            role: typeof user.role === 'string' ? user.role : user.role.getValue(),
            ...(user.companyId && { companyId: user.companyId })
        });

        return {
            accessToken,
            role: typeof user.role === 'string' ? user.role : user.role.getValue(),
            newRefreshToken: newTokenData.token,
        };
    }
}
