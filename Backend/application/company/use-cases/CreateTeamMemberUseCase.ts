import crypto from 'crypto';
import { UserRepository } from '../../../domain/user/repositories/UserRepository.js';
import { PasswordHasherPort } from '../../auth/ports/PasswordHasherPort.js';
import { EmailServicePort } from '../../auth/ports/EmailServicePort.js';
import { User } from '../../../domain/user/entities/User.js';
import { Email } from '../../../domain/user/value-objects/Email.js';
import { Role, RoleType } from '../../../domain/user/value-objects/Role.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { ResolveCompanyForUserUseCase } from './ResolveCompanyForUserUseCase.js';

export interface CreateTeamMemberDTO {
    fullName: string;
    email: string;
    role: 'hr' | 'interviewer';
    userId: string;
    companyIdFromToken?: string;
}

export class CreateTeamMemberUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasherPort,
        private readonly emailService: EmailServicePort,
        private readonly resolveCompany: ResolveCompanyForUserUseCase
    ) {}

    async execute(dto: CreateTeamMemberDTO): Promise<{ message: string; userId: string }> {
        const companyId = await this.resolveCompany.execute(dto.userId, dto.companyIdFromToken);

        const email = new Email(dto.email);
        const role = new Role(dto.role as RoleType);

        const existing = await this.userRepository.findByEmail(email);
        if (existing) {
            throw AppError.conflict('A user with this email already exists');
        }

        const temporaryPassword = this.generatePassword();
        const passwordHash = await this.passwordHasher.hash(temporaryPassword);

        const user = User.create({
            fullName: dto.fullName,
            email,
            passwordHash,
            role,
            companyId,
        });

        user.markEmailAsVerified();
        await this.userRepository.save(user);

        await this.emailService.sendWelcomeEmail(
            dto.email,
            dto.fullName,
            dto.role,
            temporaryPassword
        );

        const roleLabel = dto.role === 'hr' ? 'HR' : 'Interviewer';
        return {
            message: `${roleLabel} account created successfully`,
            userId: user.id || '',
        };
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
