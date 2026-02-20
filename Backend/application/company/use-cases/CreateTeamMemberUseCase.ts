import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types';
import { UserRepositoryPort } from "../../shared/ports/repository/UserRepositoryPort.js";
import { PasswordHasherPort } from "../../auth/ports/services/PasswordHasherPort.js";
import { EmailServicePort } from "../../auth/ports/services/EmailServicePort.js";
import { User } from "../../../domain/user/entities/User.js";
import { Email } from "../../../domain/user/value-objects/Email.js";
import { Role, RoleType } from "../../../domain/user/value-objects/Role.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { ResolveCompanyForUserUseCase } from "./ResolveCompanyForUserUseCase.js";
import { CryptoRandomPort } from "../../shared/ports/services/CryptoRandomPort";
import type { CreateTeamMemberUseCasePort, CreateTeamMemberDTO } from "../ports/usecase/CreateTeamMemberUseCasePort";

@injectable()
export class CreateTeamMemberUseCase implements CreateTeamMemberUseCasePort {
    constructor(
        @inject(TYPES.UserRepositoryPort) private readonly userRepository: UserRepositoryPort,
        @inject(TYPES.PasswordHasherPort) private readonly passwordHasher: PasswordHasherPort,
        @inject(TYPES.EmailServicePort) private readonly emailService: EmailServicePort,
        @inject(ResolveCompanyForUserUseCase) private readonly resolveCompany: ResolveCompanyForUserUseCase,
        @inject(TYPES.CryptoRandomPort) private readonly cryptoRandom: CryptoRandomPort
    ) {}

    async execute(dto: CreateTeamMemberDTO): Promise<{ message: string; userId: string }> {
        const companyId = await this.resolveCompany.execute(dto.userId, dto.companyIdFromToken);

        const email = new Email(dto.email);
        const role = new Role(dto.role as RoleType);

        const existing = await this.userRepository.findByEmail(email);
        if (existing) {
            throw AppError.conflict('A user with this email already exists');
        }

          0

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
        const chars =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";

        return this.cryptoRandom.generateRandomString(12, chars);
    }
}
