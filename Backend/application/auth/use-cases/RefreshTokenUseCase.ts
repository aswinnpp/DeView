import { TokenServicePort } from '../ports/TokenServicePort.js';
import { UserRepository } from '../../../domain/user/repositories/UserRepository.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { SecureJwtTokenService } from '../../../infrastructure/security/SecureJwtTokenService.js';

export interface RefreshTokenRequest {
    refreshToken: string;
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
        if (!request.refreshToken) {
            throw AppError.unauthorized('No refresh token provided');
        }

        // Cast to SecureJwtTokenService to access verifyRefreshToken
        const secureTokenService = this.tokenService as SecureJwtTokenService;

        // Verify refresh token (checks JWT + Redis)
        const decoded = await secureTokenService.verifyRefreshToken(request.refreshToken);
        if (!decoded) {
            throw AppError.unauthorized('Invalid or expired refresh token');
        }

        // Rotate the token (delete old, create new)
        const newTokenData = await this.tokenService.rotateRefreshToken(request.refreshToken);

        if (!newTokenData) {
            throw AppError.unauthorized('Failed to rotate refresh token');
        }

        // Get user info
        const user = await this.userRepository.findById(decoded.userId);
        if (!user) {
            throw AppError.unauthorized('User not found');
        }

        // Generate new access token
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
