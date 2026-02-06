import { UserRepository } from '../../../domain/user/repositories/UserRepository.js';
import { Email } from '../../../domain/user/value-objects/Email.js';
import { PasswordHasherPort } from '../ports/PasswordHasherPort.js';
import { TokenServicePort } from '../ports/TokenServicePort.js';
import { ValidationError } from '../../../shared/errors/ValidationError.js';
import { LoginRequestDTO } from '../dtos/LoginRequestDTO.js';
import { LoginResponseDTO } from '../dtos/LoginResponseDTO.js';

export class LoginUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasherPort,
        private readonly tokenService: TokenServicePort
    ) { }

    async execute(dto: LoginRequestDTO): Promise<LoginResponseDTO> {
        const email = new Email(dto.email);
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new ValidationError('Invalid email or password');
        }

        if (user.authProvider === 'google') {
            throw new ValidationError('This account was created with Google. Please use "Continue with Google" to login.');
        }

        if (!user.isEmailVerified) {
            throw new ValidationError('Please verify your email before logging in');
        }

        const isPasswordValid = await this.passwordHasher.compare(
            dto.password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            throw new ValidationError('Invalid email or password');
        }

        if (!user.isActive) {
            throw new ValidationError('Account is deactivated');
        }

        const tokenPayload = {
            userId: user.id!,
            role: user.role.getValue(),
            ...(user.companyId && { companyId: user.companyId })
        };
        const accessToken = this.tokenService.signAccessToken(tokenPayload);
        const refreshTokenData = await this.tokenService.generateRefreshToken(user.id!);

        return {
            user: {
                id: user.id!,
                fullName: user.fullName,
                email: user.email.getValue(),
                role: user.role.getValue(),
            },
            accessToken,
            refreshToken: refreshTokenData.token,
            refreshTokenHash: refreshTokenData.tokenHash,
        };
    }
}
