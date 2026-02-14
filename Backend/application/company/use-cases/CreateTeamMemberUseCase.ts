import crypto from 'crypto';
import { UserRepository } from '../../../domain/user/repositories/UserRepository.js';
import { PasswordHasherPort } from '../../auth/ports/PasswordHasherPort.js';
import { EmailServicePort } from '../../auth/ports/EmailServicePort.js';
import { User } from '../../../domain/user/entities/User.js';
import { Email } from '../../../domain/user/value-objects/Email.js';
import { Role, RoleType } from '../../../domain/user/value-objects/Role.js';
import { AppError } from '../../../shared/errors/AppError.js';

interface CreateTeamMemberDTO {
    fullName: string;
    email: string;
    role: 'hr' | 'interviewer';
    companyId: string;
}

export class CreateTeamMemberUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasherPort,
        private readonly emailService: EmailServicePort
    ) { }

    async execute(dto: CreateTeamMemberDTO): Promise<{ userId: string }> {
        const email = new Email(dto.email);
        const role = new Role(dto.role as RoleType);

        // Check if email is already registered
        const existing = await this.userRepository.findByEmail(email);
        if (existing) {
            throw AppError.conflict('A user with this email already exists');
        }

        // Generate a random temporary password (12 chars, alphanumeric + symbols)
        const temporaryPassword = this.generatePassword();
        const passwordHash = await this.passwordHasher.hash(temporaryPassword);

        // Create the user entity
        const user = User.create({
            fullName: dto.fullName,
            email,
            passwordHash,
            role,
            companyId: dto.companyId,
        });

        // Mark email as verified since the company is creating the account
        user.markEmailAsVerified();

        // Save to database
        await this.userRepository.save(user);

        // Send welcome email with temporary password
        await this.emailService.sendWelcomeEmail(
            dto.email,
            dto.fullName,
            dto.role,
            temporaryPassword
        );

        return { userId: user.id || '' };
    }

    private generatePassword(): string {
        // Generate a 12-character random password
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
        const bytes = crypto.randomBytes(12);
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars[bytes[i] % chars.length];
        }
        return password;
    }
}
